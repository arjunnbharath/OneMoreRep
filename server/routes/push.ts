import { Router } from 'express'
import { createRequire } from 'node:module'
import { AuthError } from '../auth-bridge.js'

const require = createRequire(import.meta.url)
const {
  getVapidPublicKey,
  saveSubscription,
  deleteSubscription,
} = require('../../api/lib/push.js')
const { getUserIdFromAuthHeader } = require('../../api/lib/friends.js')

const router = Router()

router.get('/vapid-public-key', (_req, res) => {
  res.json({ publicKey: getVapidPublicKey() })
})

router.post('/subscribe', async (req, res) => {
  try {
    const userId = await getUserIdFromAuthHeader(req.headers.authorization)
    const { subscription } = req.body ?? {}
    const result = await saveSubscription(userId, subscription)
    res.json(result)
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message })
      return
    }
    console.error('Push subscribe error:', err)
    res.status(500).json({ error: 'Failed to save subscription' })
  }
})

router.delete('/subscribe', async (req, res) => {
  try {
    const userId = await getUserIdFromAuthHeader(req.headers.authorization)
    const endpoint = req.query.endpoint ?? req.body?.endpoint
    const result = await deleteSubscription(userId, endpoint)
    res.json(result)
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message })
      return
    }
    console.error('Push unsubscribe error:', err)
    res.status(500).json({ error: 'Failed to remove subscription' })
  }
})

export default router
