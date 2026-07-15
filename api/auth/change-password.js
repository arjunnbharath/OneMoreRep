const { AuthError, changeUserPassword } = require('../lib/auth.js')

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const token = authHeader.slice(7)
    const { currentPassword, newPassword } = req.body ?? {}

    await changeUserPassword(token, currentPassword, newPassword)
    return res.status(200).json({ success: true })
  } catch (err) {
    if (err instanceof AuthError) {
      return res.status(err.status).json({ error: err.message })
    }
    console.error('Change password error:', err)
    const message = err instanceof Error ? err.message : 'Failed to change password'
    return res.status(500).json({ error: message })
  }
}
