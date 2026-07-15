import { Router } from 'express'
import { createRequire } from 'node:module'
import { AuthError } from '../auth-bridge.js'

const require = createRequire(import.meta.url)
const {
  getUserIdFromAuthHeader,
  getAllUserData,
  setUserDataEntry,
} = require('../api/lib/userData.js')

const router = Router()

router.get('/', async (req, res) => {
  try {
    const userId = await getUserIdFromAuthHeader(req.headers.authorization)
    const data = await getAllUserData(userId)
    res.json({ data })
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message })
      return
    }
    console.error('User data GET error:', err)
    res.status(500).json({ error: 'Failed to load user data' })
  }
})

router.put('/', async (req, res) => {
  try {
    const userId = await getUserIdFromAuthHeader(req.headers.authorization)
    const { key, data } = req.body ?? {}
    if (!key || typeof key !== 'string') {
      res.status(400).json({ error: 'key is required' })
      return
    }
    if (key.length > 64) {
      res.status(400).json({ error: 'Invalid key' })
      return
    }
    await setUserDataEntry(userId, key, data ?? null)
    res.json({ success: true })
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message })
      return
    }
    console.error('User data PUT error:', err)
    res.status(500).json({ error: 'Failed to save user data' })
  }
})

export default router
