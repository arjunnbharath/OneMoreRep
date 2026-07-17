const { AuthError } = require('../lib/auth.js')
const { getUserIdFromAuthHeader, getFriendProgress } = require('../lib/friends.js')

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const userId = await getUserIdFromAuthHeader(req.headers.authorization)
    const friendId = req.query?.friendId
    const data = await getFriendProgress(userId, friendId)
    return res.status(200).json(data)
  } catch (err) {
    if (err instanceof AuthError) {
      return res.status(err.status).json({ error: err.message })
    }
    console.error('Friend progress error:', err)
    return res.status(500).json({ error: 'Failed to load friend progress' })
  }
}
