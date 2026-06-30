import type { VercelRequest, VercelResponse } from '@vercel/node'
import { AuthError, registerUser } from '../../server/auth-service'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { name, email, password } = req.body as {
      name?: string
      email?: string
      password?: string
    }
    const data = await registerUser(name ?? '', email ?? '', password ?? '')
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
