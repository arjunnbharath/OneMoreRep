import { Router } from 'express'
import { createRequire } from 'node:module'
import { AuthError } from '../auth-bridge.js'

const require = createRequire(import.meta.url)
const {
  getUserIdFromAuthHeader,
  listFriends,
  addFriendByUsername,
  removeFriend,
  getFriendProgress,
} = require('../../api/lib/friends.js')
const { sendNudge, listNudges, markNudgesRead, clearNudges } = require('../../api/lib/friendNudges.js')
const { setFriendNotificationMute } = require('../../api/lib/friendMutes.js')

const router = Router()

router.get('/', async (req, res) => {
  try {
    const userId = await getUserIdFromAuthHeader(req.headers.authorization)
    const friends = await listFriends(userId)
    res.json({ friends })
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message })
      return
    }
    console.error('Friends GET error:', err)
    res.status(500).json({ error: 'Failed to load friends' })
  }
})

router.post('/', async (req, res) => {
  try {
    const userId = await getUserIdFromAuthHeader(req.headers.authorization)
    const { username } = req.body ?? {}
    const friend = await addFriendByUsername(userId, username ?? '')
    res.status(201).json({ friend })
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message })
      return
    }
    console.error('Friends POST error:', err)
    res.status(500).json({ error: 'Failed to add friend' })
  }
})

router.delete('/', async (req, res) => {
  try {
    const userId = await getUserIdFromAuthHeader(req.headers.authorization)
    const friendId = req.query.friendId ?? req.body?.friendId
    await removeFriend(userId, friendId)
    res.json({ success: true })
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message })
      return
    }
    console.error('Friends DELETE error:', err)
    res.status(500).json({ error: 'Failed to remove friend' })
  }
})

router.get('/progress', async (req, res) => {
  try {
    const userId = await getUserIdFromAuthHeader(req.headers.authorization)
    const friendId = req.query.friendId
    const data = await getFriendProgress(userId, friendId)
    res.json(data)
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message })
      return
    }
    console.error('Friend progress error:', err)
    res.status(500).json({ error: 'Failed to load friend progress' })
  }
})

router.post('/nudge', async (req, res) => {
  try {
    const userId = await getUserIdFromAuthHeader(req.headers.authorization)
    const { friendId, type } = req.body ?? {}
    const nudge = await sendNudge(userId, friendId, type)
    res.status(201).json({ nudge })
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message })
      return
    }
    console.error('Friend nudge error:', err)
    res.status(500).json({ error: 'Failed to send nudge' })
  }
})

router.get('/nudges', async (req, res) => {
  try {
    const userId = await getUserIdFromAuthHeader(req.headers.authorization)
    const nudges = await listNudges(userId)
    res.json({ nudges })
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message })
      return
    }
    console.error('Friend nudges error:', err)
    res.status(500).json({ error: 'Failed to load nudges' })
  }
})

router.post('/nudges/read', async (req, res) => {
  try {
    const userId = await getUserIdFromAuthHeader(req.headers.authorization)
    const { nudgeIds } = req.body ?? {}
    const result = await markNudgesRead(userId, nudgeIds)
    res.json(result)
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message })
      return
    }
    console.error('Mark nudges read error:', err)
    res.status(500).json({ error: 'Failed to update nudges' })
  }
})

router.delete('/nudges', async (req, res) => {
  try {
    const userId = await getUserIdFromAuthHeader(req.headers.authorization)
    const result = await clearNudges(userId)
    res.json(result)
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message })
      return
    }
    console.error('Clear nudges error:', err)
    res.status(500).json({ error: 'Failed to delete notifications' })
  }
})

router.put('/mute', async (req, res) => {
  try {
    const userId = await getUserIdFromAuthHeader(req.headers.authorization)
    const { friendId, muted } = req.body ?? {}
    const result = await setFriendNotificationMute(userId, friendId, Boolean(muted))
    res.json(result)
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message })
      return
    }
    console.error('Friend mute error:', err)
    res.status(500).json({ error: 'Failed to update mute' })
  }
})

export default router
