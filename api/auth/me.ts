import type { VercelRequest, VercelResponse } from '@vercel/node'
import { AuthError, getUserFromToken } from '../../server/auth-service'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const token = authHeader.slice(7)
    const user = await getUserFromToken(token)
    return res.json({ user })
  } catch (err) {
    if (err instanceof AuthError) {
      return res.status(err.status).json({ error: err.message })
    }
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
