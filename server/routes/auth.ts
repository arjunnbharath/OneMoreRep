import { Router } from 'express'
import {
  AuthError,
  getUserFromToken,
  loginUser,
  loginWithApple,
  loginWithGoogle,
  registerUser,
} from './auth-bridge.js'

const router = Router()

router.get('/config', (_req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '',
    appleClientId: process.env.APPLE_CLIENT_ID || process.env.VITE_APPLE_CLIENT_ID || '',
  })
})

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body
    const data = await loginWithGoogle(credential)
    res.json(data)
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message })
      return
    }
    console.error('Google auth error:', err)
    res.status(500).json({ error: 'Google sign-in failed' })
  }
})

router.post('/apple', async (req, res) => {
  try {
    const { idToken, user } = req.body
    const data = await loginWithApple(idToken, user)
    res.json(data)
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message })
      return
    }
    console.error('Apple auth error:', err)
    res.status(500).json({ error: 'Apple sign-in failed' })
  }
})

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
