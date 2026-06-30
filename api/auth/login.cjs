const { AuthError, loginUser } = require('../lib/auth.cjs')

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const { email, password } = body || {}
    const data = await loginUser(email || '', password || '')
    return res.status(200).json(data)
  } catch (err) {
    if (err instanceof AuthError) {
      return res.status(err.status).json({ error: err.message })
    }
    console.error('Login error:', err)
    const message = err instanceof Error ? err.message : 'Failed to log in'
    return res.status(500).json({ error: message })
  }
}
