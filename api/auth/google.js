const { AuthError, loginWithGoogle } = require('../lib/oauth.js')

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const { credential } = body || {}
    const data = await loginWithGoogle(credential)
    return res.status(200).json(data)
  } catch (err) {
    if (err instanceof AuthError) {
      return res.status(err.status).json({ error: err.message })
    }
    console.error('Google auth error:', err)
    const message = err instanceof Error ? err.message : 'Google sign-in failed'
    return res.status(500).json({ error: message })
  }
}
