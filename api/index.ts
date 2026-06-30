import express from 'express'
import { AuthError, getUserFromToken, loginUser, registerUser } from '../lib/auth'
import { ensureDb } from '../lib/db'

const app = express()
app.use(express.json())

app.get('/health', async (_req, res) => {
  try {
    await ensureDb()
    res.json({ ok: true, database: 'connected' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Database check failed'
    res.status(500).json({ ok: false, error: message })
  }
})

app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body as {
      name?: string
      email?: string
      password?: string
    }
    const data = await registerUser(name ?? '', email ?? '', password ?? '')
    res.status(201).json(data)
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message })
      return
    }
    console.error('Register error:', err)
    const message = err instanceof Error ? err.message : 'Failed to create account'
    res.status(500).json({ error: message })
  }
})

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string }
    const data = await loginUser(email ?? '', password ?? '')
    res.json(data)
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message })
      return
    }
    console.error('Login error:', err)
    const message = err instanceof Error ? err.message : 'Failed to log in'
    res.status(500).json({ error: message })
  }
})

app.get('/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Not authenticated' })
      return
    }

    const token = authHeader.slice(7)
    const user = await getUserFromToken(token)
    res.json({ user })
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message })
      return
    }
    res.status(401).json({ error: 'Invalid or expired token' })
  }
})

export default app
