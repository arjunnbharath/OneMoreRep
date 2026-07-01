const { AuthError, registerUser } = require('../lib/auth.js')

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const { name, email, password, avatar } = body || {}
    const data = await registerUser(name || '', email || '', password || '', avatar)
    return res.status(201).json(data)
  } catch (err) {
    if (err instanceof AuthError) {
      return res.status(err.status).json({ error: err.message })
    }
    console.error('Register error:', err)
    const message = err instanceof Error ? err.message : 'Failed to create account'
    return res.status(500).json({ error: message })
  }
}
