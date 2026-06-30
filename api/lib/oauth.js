const { OAuth2Client } = require('google-auth-library')
const verifyAppleToken =
  require('verify-apple-id-token').default || require('verify-apple-id-token')
const jwt = require('jsonwebtoken')
const { query, ensureDb } = require('./db.js')

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

class AuthError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

function issueSession(user) {
  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email },
  }
}

async function findOrCreateOAuthUser({ provider, providerId, email, name }) {
  await ensureDb()

  const byOAuth = await query(
    'SELECT id, name, email FROM users WHERE auth_provider = $1 AND oauth_sub = $2',
    [provider, providerId],
  )

  if (byOAuth.rows.length > 0) {
    return issueSession(byOAuth.rows[0])
  }

  const normalizedEmail = email?.trim().toLowerCase()

  if (normalizedEmail) {
    const byEmail = await query(
      'SELECT id, name, email, auth_provider, oauth_sub FROM users WHERE email = $1',
      [normalizedEmail],
    )

    if (byEmail.rows.length > 0) {
      const existing = byEmail.rows[0]

      if (existing.auth_provider !== 'local' && existing.oauth_sub !== providerId) {
        throw new AuthError('This email is linked to another sign-in method', 409)
      }

      await query('UPDATE users SET auth_provider = $1, oauth_sub = $2 WHERE id = $3', [
        provider,
        providerId,
        existing.id,
      ])

      return issueSession(existing)
    }
  }

  const displayName = name?.trim() || normalizedEmail?.split('@')[0] || 'User'
  const userEmail = normalizedEmail || `${providerId}@${provider}.oauth`

  const created = await query(
    `INSERT INTO users (name, email, password_hash, auth_provider, oauth_sub)
     VALUES ($1, $2, NULL, $3, $4)
     RETURNING id, name, email`,
    [displayName, userEmail, provider, providerId],
  )

  return issueSession(created.rows[0])
}

async function loginWithGoogle(credential) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    throw new AuthError('Google sign-in is not configured', 503)
  }

  if (!credential) {
    throw new AuthError('Google credential is required', 400)
  }

  const client = new OAuth2Client(clientId)
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: clientId,
  })

  const payload = ticket.getPayload()
  if (!payload?.sub) {
    throw new AuthError('Invalid Google token', 401)
  }

  return findOrCreateOAuthUser({
    provider: 'google',
    providerId: payload.sub,
    email: payload.email,
    name: payload.name,
  })
}

async function loginWithApple(idToken, user) {
  const clientId = process.env.APPLE_CLIENT_ID
  if (!clientId) {
    throw new AuthError('Apple sign-in is not configured', 503)
  }

  if (!idToken) {
    throw new AuthError('Apple identity token is required', 400)
  }

  const jwtClaims = await verifyAppleToken({
    idToken,
    clientId,
  })

  const appleName =
    user?.name?.firstName || user?.name?.lastName
      ? [user?.name?.firstName, user?.name?.lastName].filter(Boolean).join(' ')
      : undefined

  return findOrCreateOAuthUser({
    provider: 'apple',
    providerId: jwtClaims.sub,
    email: jwtClaims.email,
    name: appleName,
  })
}

module.exports = { AuthError, loginWithGoogle, loginWithApple }
