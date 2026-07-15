const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { query, ensureDb } = require('./db.js')

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

class AuthError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function registerUser(name, email, password, avatar) {
  await ensureDb()

  if (!name?.trim() || !email?.trim() || !password) {
    throw new AuthError('Name, email, and password are required', 400)
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

  const normalizedEmail = email.trim().toLowerCase()
  const existing = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail])

  if (existing.rows.length > 0) {
    throw new AuthError('An account with this email already exists', 409)
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const avatarUrl = avatar && typeof avatar === 'string' && avatar.length > 0 ? avatar : null
  const result = await query(
    'INSERT INTO users (name, email, password_hash, avatar_url) VALUES ($1, $2, $3, $4) RETURNING id, name, email, avatar_url, created_at',
    [name.trim(), normalizedEmail, passwordHash, avatarUrl],
  )

  const user = result.rows[0]
  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatar_url ?? null,
    },
  }
}

async function loginUser(email, password) {
  await ensureDb()

  if (!email?.trim() || !password) {
    throw new AuthError('Email and password are required', 400)
  }

  const normalizedEmail = email.trim().toLowerCase()
  const result = await query(
    'SELECT id, name, email, password_hash, avatar_url FROM users WHERE email = $1',
    [normalizedEmail],
  )

  if (result.rows.length === 0) {
    throw new AuthError('Invalid email or password', 401)
  }

  const user = result.rows[0]
  const valid = await bcrypt.compare(password, user.password_hash)

  if (!valid) {
    throw new AuthError('Invalid email or password', 401)
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatar_url ?? null,
    },
  }
}

async function getUserFromToken(token) {
  await ensureDb()

  const payload = jwt.verify(token, JWT_SECRET)
  const result = await query('SELECT id, name, email, avatar_url, created_at FROM users WHERE id = $1', [
    payload.userId,
  ])

  if (result.rows.length === 0) {
    throw new AuthError('User not found', 401)
  }

  const user = result.rows[0]
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatar_url ?? null,
    createdAt: user.created_at,
  }
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

module.exports = { AuthError, registerUser, loginUser, getUserFromToken, changeUserPassword, deleteUser }
