const { AuthError, loginWithApple } = require('../lib/oauth.js')

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const { idToken, user } = body || {}
    const data = await loginWithApple(idToken, user)
    return res.status(200).json(data)
  } catch (err) {
    if (err instanceof AuthError) {
      return res.status(err.status).json({ error: err.message })
    }
    console.error('Apple auth error:', err)
    const message = err instanceof Error ? err.message : 'Apple sign-in failed'
    return res.status(500).json({ error: message })
  }
}
