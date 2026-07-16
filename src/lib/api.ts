export interface User {
  id: number
  name: string
  email: string
  avatarUrl?: string | null
  createdAt?: string
}

export interface AuthResponse {
  token: string
  user: User
}

function apiUrl(path: string) {
  const base = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? ''
  return `${base}${path}`
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
    if (text.includes('FUNCTION_INVOCATION_FAILED')) {
      return 'Server crashed on Vercel. Check function logs and that DATABASE_URL is set, then redeploy.'
    }
    try {
      const data = JSON.parse(text) as { error?: string; message?: string }
      if (data.error) return data.error
      if (data.message) return data.message
    } catch {
      // not JSON
    }
    if (!text.trim()) {
      return 'API server is not reachable. Run "npm run dev" locally, or check your deployed API.'
    }
    return text.slice(0, 200) || 'Server error. Check DATABASE_URL is set in your environment.'
  }

  return text || `Request failed (${res.status})`
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  let res: Response

  try {
    res = await fetch(url, options)
  } catch {
    throw new Error(
      'Cannot reach the server. Check your internet connection or set VITE_API_URL for native builds.',
    )
  }

  if (!res.ok) {
    throw new Error(await parseError(res))
  }

  return res.json() as Promise<T>
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>(apiUrl('/api/auth/login'), {
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
  return request<AuthResponse>(apiUrl('/api/auth/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })
}

export async function getMe(token: string): Promise<{ user: User }> {
  return request<{ user: User }>(apiUrl('/api/auth/me'), {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function deleteAccount(token: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(apiUrl('/api/auth/delete'), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function changePassword(
  token: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(apiUrl('/api/auth/change-password'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  })
}

export async function updateAvatar(
  token: string,
  avatar: string | null,
): Promise<{ user: User }> {
  return request<{ user: User }>(apiUrl('/api/auth/avatar'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ avatar }),
  })
}

export async function getUserData(
  token: string,
): Promise<{ data: Record<string, unknown> }> {
  return request<{ data: Record<string, unknown> }>(apiUrl('/api/user-data'), {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function putUserData(
  token: string,
  key: string,
  data: unknown,
): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(apiUrl('/api/user-data'), {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ key, data }),
  })
}

export async function clearAllUserData(token: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(apiUrl('/api/user-data'), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}
