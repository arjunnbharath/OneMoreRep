const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { query, ensureDb } = require('./db.js')

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/

class AuthError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

function normalizeUsername(username) {
  return username.trim().toLowerCase()
}

function validateUsername(username) {
  if (!username?.trim() || !USERNAME_RE.test(username.trim())) {
    throw new AuthError(
      'User ID must be 3-20 characters and use letters, numbers, or underscores',
      400,
    )
  }
  return normalizeUsername(username)
}

function formatUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username ?? null,
    avatarUrl: user.avatar_url ?? null,
    createdAt: user.created_at,
  }
}

async function registerUser(name, username, email, password, avatar) {
  await ensureDb()

  if (!name?.trim() || !username?.trim() || !email?.trim() || !password) {
    throw new AuthError('Name, user ID, email, and password are required', 400)
  }

  if (avatar != null && avatar !== '') {
    if (typeof avatar !== 'string' || !avatar.startsWith('data:image/')) {
      throw new AuthError('Invalid profile image', 400)
    }
    if (avatar.length > 500000) {
      throw new AuthError('Profile image is too large', 400)
    }
  }

  if (password.length < 6) {
    throw new AuthError('Password must be at least 6 characters', 400)
  }

  const normalizedUsername = validateUsername(username)
  const normalizedEmail = email.trim().toLowerCase()

  const existingEmail = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail])
  if (existingEmail.rows.length > 0) {
    throw new AuthError('An account with this email already exists', 409)
  }

  const existingUsername = await query('SELECT id FROM users WHERE LOWER(username) = $1', [
    normalizedUsername,
  ])
  if (existingUsername.rows.length > 0) {
    throw new AuthError('This user ID is already taken', 409)
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const avatarUrl = avatar && typeof avatar === 'string' && avatar.length > 0 ? avatar : null
  const result = await query(
    'INSERT INTO users (name, username, email, password_hash, avatar_url) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, username, email, avatar_url, created_at',
    [name.trim(), normalizedUsername, normalizedEmail, passwordHash, avatarUrl],
  )

  const user = result.rows[0]
  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })

  return {
    token,
    user: formatUser(user),
  }
}

async function loginUser(identifier, password) {
  await ensureDb()

  if (!identifier?.trim() || !password) {
    throw new AuthError('User ID or email and password are required', 400)
  }

  const trimmed = identifier.trim()
  const isEmail = trimmed.includes('@')
  const result = isEmail
    ? await query(
        'SELECT id, name, username, email, password_hash, avatar_url, created_at FROM users WHERE email = $1',
        [trimmed.toLowerCase()],
      )
    : await query(
        'SELECT id, name, username, email, password_hash, avatar_url, created_at FROM users WHERE LOWER(username) = $1',
        [normalizeUsername(trimmed)],
      )

  if (result.rows.length === 0) {
    throw new AuthError('Invalid user ID, email, or password', 401)
  }

  const user = result.rows[0]
  const valid = await bcrypt.compare(password, user.password_hash)

  if (!valid) {
    throw new AuthError('Invalid user ID, email, or password', 401)
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })

  return {
    token,
    user: formatUser(user),
  }
}

async function getUserFromToken(token) {
  await ensureDb()

  const payload = jwt.verify(token, JWT_SECRET)
  const result = await query(
    'SELECT id, name, username, email, avatar_url, created_at FROM users WHERE id = $1',
    [payload.userId],
  )

  if (result.rows.length === 0) {
    throw new AuthError('User not found', 401)
  }

  return formatUser(result.rows[0])
}

async function changeUserPassword(token, currentPassword, newPassword) {
  await ensureDb()

  if (!currentPassword || !newPassword) {
    throw new AuthError('Current and new password are required', 400)
  }

  if (newPassword.length < 6) {
    throw new AuthError('Password must be at least 6 characters', 400)
  }

  const payload = jwt.verify(token, JWT_SECRET)
  const result = await query('SELECT password_hash FROM users WHERE id = $1', [payload.userId])

  if (result.rows.length === 0) {
    throw new AuthError('User not found', 401)
  }

  const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash)
  if (!valid) {
    throw new AuthError('Current password is incorrect', 401)
  }

  const passwordHash = await bcrypt.hash(newPassword, 10)
  await query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, payload.userId])

  return { success: true }
}

async function deleteUser(token) {
  await ensureDb()

  const payload = jwt.verify(token, JWT_SECRET)
  const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [payload.userId])

  if (result.rows.length === 0) {
    throw new AuthError('User not found', 404)
  }

  return { success: true }
}

function normalizeAvatar(avatar) {
  if (avatar == null || avatar === '') return null
  if (typeof avatar !== 'string' || !avatar.startsWith('data:image/')) {
    throw new AuthError('Invalid profile image', 400)
  }
  if (avatar.length > 500000) {
    throw new AuthError('Profile image is too large', 400)
  }
  return avatar
}

async function updateUserAvatar(token, avatar) {
  await ensureDb()

  const avatarUrl = normalizeAvatar(avatar)
  const payload = jwt.verify(token, JWT_SECRET)
  const result = await query(
    'UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING id, name, username, email, avatar_url, created_at',
    [avatarUrl, payload.userId],
  )

  if (result.rows.length === 0) {
    throw new AuthError('User not found', 401)
  }

  return formatUser(result.rows[0])
}

module.exports = {
  AuthError,
  registerUser,
  loginUser,
  getUserFromToken,
  changeUserPassword,
  deleteUser,
  updateUserAvatar,
}
