import { Router } from 'express'
import { createRequire } from 'node:module'
import { AuthError } from '../auth-bridge.js'

const require = createRequire(import.meta.url)
const {
  loginAdmin,
  requireAdmin,
  listUsers,
  getUserById,
  getUserDataSummary,
  getUserDataForAdmin,
  clearUserDataForAdmin,
  deleteUserForAdmin,
  deleteUsersForAdmin,
  resetUserPasswordForAdmin,
  setUserAdminAccess,
  clearAllUsersData,
  deleteAllUsers,
} = require('../../api/lib/admin.js')

const router = Router()

function parseUserId(value: string) {
  const id = Number(value)
  if (!Number.isInteger(id) || id <= 0) return null
  return id
}

router.post('/login', async (req, res) => {
  try {
    const { username, identifier, password } = req.body ?? {}
    const data = await loginAdmin(username ?? identifier ?? '', password ?? '')
    res.json(data)
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message })
      return
    }
    console.error('Admin login error:', err)
    res.status(500).json({ error: 'Failed to sign in' })
  }
})

router.get('/me', async (req, res) => {
  try {
    const auth = await requireAdmin(req.headers.authorization)
    res.json({
      authenticated: true,
      username: auth.username,
      role: auth.type,
    })
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message })
      return
    }
    console.error('Admin me error:', err)
    res.status(500).json({ error: 'Failed to check admin access' })
  }
})

router.get('/users', async (req, res) => {
  try {
    await requireAdmin(req.headers.authorization)
    const search = String(req.query.search ?? '')
    const limit = Number(req.query.limit) || 50
    const offset = Number(req.query.offset) || 0
    const users = await listUsers({ search, limit, offset })
    res.json({ users })
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message })
      return
    }
    console.error('Admin list users error:', err)
    res.status(500).json({ error: 'Failed to list users' })
  }
})

router.patch('/users/:id/admin-access', async (req, res) => {
  try {
    await requireAdmin(req.headers.authorization)
    const userId = parseUserId(req.params.id)
    if (!userId) {
      res.status(400).json({ error: 'Invalid user id' })
      return
    }
    const enabled = Boolean(req.body?.enabled)
    const user = await setUserAdminAccess(userId, enabled)
    res.json({ user })
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message })
      return
    }
    console.error('Admin access update error:', err)
    res.status(500).json({ error: 'Failed to update admin access' })
  }
})

router.delete('/users/bulk', async (req, res) => {
  try {
    await requireAdmin(req.headers.authorization)
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : []
    const deleted = await deleteUsersForAdmin(ids)
    res.json({ success: true, deleted })
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message })
      return
    }
    console.error('Admin bulk delete error:', err)
    res.status(500).json({ error: 'Failed to delete selected users' })
  }
})

router.delete('/users/all/data', async (req, res) => {
  try {
    await requireAdmin(req.headers.authorization)
    await clearAllUsersData()
    res.json({ success: true })
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message })
      return
    }
    console.error('Admin clear all data error:', err)
    res.status(500).json({ error: 'Failed to clear all user data' })
  }
})

router.delete('/users/all', async (req, res) => {
  try {
    await requireAdmin(req.headers.authorization)
    const deleted = await deleteAllUsers()
    res.json({ success: true, deleted })
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message })
      return
    }
    console.error('Admin delete all users error:', err)
    res.status(500).json({ error: 'Failed to delete all users' })
  }
})

router.patch('/users/:id/password', async (req, res) => {
  try {
    await requireAdmin(req.headers.authorization)
    const userId = parseUserId(req.params.id)
    if (!userId) {
      res.status(400).json({ error: 'Invalid user id' })
      return
    }
    const password = String(req.body?.password ?? '')
    await resetUserPasswordForAdmin(userId, password)
    res.json({ success: true })
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message })
      return
    }
    console.error('Admin reset password error:', err)
    res.status(500).json({ error: 'Failed to reset password' })
  }
})

router.get('/users/:id/data', async (req, res) => {
  try {
    await requireAdmin(req.headers.authorization)
    const userId = parseUserId(req.params.id)
    if (!userId) {
      res.status(400).json({ error: 'Invalid user id' })
      return
    }
    const data = await getUserDataForAdmin(userId)
    res.json({ data })
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message })
      return
    }
    console.error('Admin get user data error:', err)
    res.status(500).json({ error: 'Failed to load user data' })
  }
})

router.delete('/users/:id/data', async (req, res) => {
  try {
    await requireAdmin(req.headers.authorization)
    const userId = parseUserId(req.params.id)
    if (!userId) {
      res.status(400).json({ error: 'Invalid user id' })
      return
    }
    await clearUserDataForAdmin(userId)
    res.json({ success: true })
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message })
      return
    }
    console.error('Admin clear user data error:', err)
    res.status(500).json({ error: 'Failed to clear user data' })
  }
})

router.get('/users/:id', async (req, res) => {
  try {
    await requireAdmin(req.headers.authorization)
    const userId = parseUserId(req.params.id)
    if (!userId) {
      res.status(400).json({ error: 'Invalid user id' })
      return
    }
    const user = await getUserById(userId)
    const dataSummary = await getUserDataSummary(userId)
    res.json({ user, dataSummary })
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message })
      return
    }
    console.error('Admin get user error:', err)
    res.status(500).json({ error: 'Failed to load user' })
  }
})

router.delete('/users/:id', async (req, res) => {
  try {
    await requireAdmin(req.headers.authorization)
    const userId = parseUserId(req.params.id)
    if (!userId) {
      res.status(400).json({ error: 'Invalid user id' })
      return
    }
    await deleteUserForAdmin(userId)
    res.json({ success: true })
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.status).json({ error: err.message })
      return
    }
    console.error('Admin delete user error:', err)
    res.status(500).json({ error: 'Failed to delete user' })
  }
})

export default router
