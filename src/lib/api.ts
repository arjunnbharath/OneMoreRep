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
  const text = await res.text()

  try {
    const data = JSON.parse(text) as { error?: string }
    if (data.error) return data.error
  } catch {
    // not JSON — fall through
  }

  if (res.status === 404) {
    return 'API not found. Run "npm run dev" locally, or deploy with API routes on Vercel.'
  }

  if (res.status >= 500) {
    return text || 'Server error. Check DATABASE_URL is set in your environment.'
  }

  return text || `Request failed (${res.status})`
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  let res: Response

  try {
    res = await fetch(url, options)
  } catch {
    throw new Error(
      'Cannot reach the server. Run "npm run dev" to start both frontend and API.',
    )
  }

  if (!res.ok) {
    throw new Error(await parseError(res))
  }

  return res.json() as Promise<T>
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })
}

export async function getMe(token: string): Promise<{ user: User }> {
  return request<{ user: User }>('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
}
