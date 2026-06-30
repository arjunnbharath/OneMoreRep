const { AuthError, getUserFromToken } = require('../lib/auth.js')

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const token = authHeader.slice(7)
    const user = await getUserFromToken(token)
    return res.status(200).json({ user })
  } catch (err) {
    if (err instanceof AuthError) {
      return res.status(err.status).json({ error: err.message })
    }
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
