import type { VercelRequest, VercelResponse } from '@vercel/node'
import { AuthError, loginUser } from '../../server/auth-service'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body as { email?: string; password?: string }
    const data = await loginUser(email ?? '', password ?? '')
    return res.json(data)
  } catch (err) {
    if (err instanceof AuthError) {
      return res.status(err.status).json({ error: err.message })
    }
    console.error('Login error:', err)
    const message = err instanceof Error ? err.message : 'Failed to log in'
    return res.status(500).json({ error: message })
  }
}
