import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { ensureDb, pool } from './db.js'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret'

export interface AuthUser {
  id: number
  name: string
  email: string
}

export class AuthError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<{ token: string; user: AuthUser }> {
  await ensureDb()

  if (!name?.trim() || !email?.trim() || !password) {
    throw new AuthError('Name, email, and password are required', 400)
  }

  if (password.length < 6) {
    throw new AuthError('Password must be at least 6 characters', 400)
  }

  const normalizedEmail = email.trim().toLowerCase()
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail])

  if (existing.rows.length > 0) {
    throw new AuthError('An account with this email already exists', 409)
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const result = await pool.query(
    'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
    [name.trim(), normalizedEmail, passwordHash],
  )

  const user = result.rows[0]
  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: '7d',
  })

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email },
  }
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ token: string; user: AuthUser }> {
  await ensureDb()

  if (!email?.trim() || !password) {
    throw new AuthError('Email and password are required', 400)
  }

  const normalizedEmail = email.trim().toLowerCase()
  const result = await pool.query(
    'SELECT id, name, email, password_hash FROM users WHERE email = $1',
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

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: '7d',
  })

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email },
  }
}

export async function getUserFromToken(token: string): Promise<AuthUser> {
  await ensureDb()

  const payload = jwt.verify(token, JWT_SECRET) as { userId: number }
  const result = await pool.query(
    'SELECT id, name, email, created_at FROM users WHERE id = $1',
    [payload.userId],
  )

  if (result.rows.length === 0) {
    throw new AuthError('User not found', 401)
  }

  const user = result.rows[0]
  return { id: user.id, name: user.name, email: user.email }
}
