import { Router } from 'express'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { AuthError, getUserFromToken, loginUser, registerUser } = require('../../lib/auth.cjs')

const router = Router()

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    const data = await registerUser(name ?? '', email ?? '', password ?? '')
    res.status(201).json(data)
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message })
      return
    }
    console.error('Register error:', err)
    res.status(500).json({ error: 'Failed to create account' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const data = await loginUser(email ?? '', password ?? '')
    res.json(data)
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message })
      return
    }
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

export default router
