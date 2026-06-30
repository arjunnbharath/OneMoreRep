import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../db.js'

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret'

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body as {
      name?: string
      email?: string
      password?: string
    }

    if (!name?.trim() || !email?.trim() || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' })
      return
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' })
      return
    }

    const normalizedEmail = email.trim().toLowerCase()
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail])

    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'An account with this email already exists' })
      return
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

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Failed to create account' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string }

    if (!email?.trim() || !password) {
      res.status(400).json({ error: 'Email and password are required' })
      return
    }

    const normalizedEmail = email.trim().toLowerCase()
    const result = await pool.query(
      'SELECT id, name, email, password_hash FROM users WHERE email = $1',
      [normalizedEmail],
    )

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    const user = result.rows[0]
    const valid = await bcrypt.compare(password, user.password_hash)

    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    })

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Failed to log in' })
  }
})

router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Not authenticated' })
      return
    }

    const token = authHeader.slice(7)
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number }

    const result = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [payload.userId],
    )

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'User not found' })
      return
    }

    const user = result.rows[0]
    res.json({ user: { id: user.id, name: user.name, email: user.email } })
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
})

export default router
