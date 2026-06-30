export interface User {
  id: number
  name: string
  email: string
}

export interface AuthResponse {
  token: string
  user: User
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json()
    return data.error ?? 'Something went wrong'
  } catch {
    return 'Something went wrong'
  }
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })

  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function getMe(token: string): Promise<{ user: User }> {
  const res = await fetch('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}
