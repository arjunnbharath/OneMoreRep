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

async function registerUser(name, email, password) {
  await ensureDb()

  if (!name?.trim() || !email?.trim() || !password) {
    throw new AuthError('Name, email, and password are required', 400)
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
  const result = await query(
    'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
    [name.trim(), normalizedEmail, passwordHash],
  )

  const user = result.rows[0]
  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email },
  }
}

async function loginUser(email, password) {
  await ensureDb()

  if (!email?.trim() || !password) {
    throw new AuthError('Email and password are required', 400)
  }

  const normalizedEmail = email.trim().toLowerCase()
  const result = await query(
    'SELECT id, name, email, password_hash FROM users WHERE email = $1',
    [normalizedEmail],
  )

  if (result.rows.length === 0) {
    throw new AuthError('Invalid email or password', 401)
  }

  const user = result.rows[0]

  if (!user.password_hash) {
    throw new AuthError('This account uses Google or Apple sign-in', 401)
  }

  const valid = await bcrypt.compare(password, user.password_hash)

  if (!valid) {
    throw new AuthError('Invalid email or password', 401)
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email },
  }
}

async function getUserFromToken(token) {
  await ensureDb()

  const payload = jwt.verify(token, JWT_SECRET)
  const result = await query('SELECT id, name, email, created_at FROM users WHERE id = $1', [
    payload.userId,
  ])

  if (result.rows.length === 0) {
    throw new AuthError('User not found', 401)
  }

  const user = result.rows[0]
  return { id: user.id, name: user.name, email: user.email }
}

module.exports = { AuthError, registerUser, loginUser, getUserFromToken }
