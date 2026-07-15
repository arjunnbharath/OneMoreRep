const { AuthError } = require('../lib/auth.js')
const {
  getUserIdFromAuthHeader,
  getAllUserData,
  setUserDataEntry,
  clearAllUserData,
} = require('../lib/userData.js')

module.exports = async function handler(req, res) {
  try {
    const userId = await getUserIdFromAuthHeader(req.headers.authorization)

    if (req.method === 'GET') {
      const data = await getAllUserData(userId)
      return res.status(200).json({ data })
    }

    if (req.method === 'PUT') {
      const { key, data } = req.body || {}
      if (!key || typeof key !== 'string') {
        return res.status(400).json({ error: 'key is required' })
      }
      if (key.length > 64) {
        return res.status(400).json({ error: 'Invalid key' })
      }
      await setUserDataEntry(userId, key, data ?? null)
      return res.status(200).json({ success: true })
    }

    if (req.method === 'DELETE') {
      await clearAllUserData(userId)
      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    if (err instanceof AuthError) {
      return res.status(err.status).json({ error: err.message })
    }
    console.error('User data error:', err)
    return res.status(500).json({ error: 'Failed to sync user data' })
  }
}
