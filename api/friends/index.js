const { AuthError } = require('../lib/auth.js')
const {
  getUserIdFromAuthHeader,
  listFriends,
  addFriendByUsername,
  removeFriend,
  getFriendProgress,
} = require('../lib/friends.js')

module.exports = async function handler(req, res) {
  try {
    const userId = await getUserIdFromAuthHeader(req.headers.authorization)

    if (req.method === 'GET') {
      const friends = await listFriends(userId)
      return res.status(200).json({ friends })
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      const { username } = body || {}
      const friend = await addFriendByUsername(userId, username || '')
      return res.status(201).json({ friend })
    }

    if (req.method === 'DELETE') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      const friendId = req.query?.friendId ?? body?.friendId
      await removeFriend(userId, friendId)
      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    if (err instanceof AuthError) {
      return res.status(err.status).json({ error: err.message })
    }
    console.error('Friends error:', err)
    return res.status(500).json({ error: 'Failed to manage friends' })
  }
}
