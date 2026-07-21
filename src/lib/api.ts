export interface User {
  id: number
  name: string
  email: string
  username?: string | null
  avatarUrl?: string | null
  createdAt?: string
}

export interface FriendUser {
  id: number
  name: string
  username: string | null
  avatarUrl?: string | null
  friendsSince?: string
  notificationsMuted?: boolean
}

export interface FriendProgressResponse {
  friend: FriendUser
  sessions: import('../types/tracker').WorkoutSession[]
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

export async function login(identifier: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>(apiUrl('/api/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  })
}

export async function register(
  name: string,
  username: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  return request<AuthResponse>(apiUrl('/api/auth/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, username, email, password }),
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

export async function getFriends(token: string): Promise<{ friends: FriendUser[] }> {
  return request<{ friends: FriendUser[] }>(apiUrl('/api/friends'), {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function addFriend(
  token: string,
  username: string,
): Promise<{ friend: FriendUser }> {
  return request<{ friend: FriendUser }>(apiUrl('/api/friends'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username }),
  })
}

export async function removeFriend(
  token: string,
  friendId: number,
): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(apiUrl(`/api/friends?friendId=${friendId}`), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function getFriendProgress(
  token: string,
  friendId: number,
): Promise<FriendProgressResponse> {
  return request<FriendProgressResponse>(apiUrl(`/api/friends/progress?friendId=${friendId}`), {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export type NudgeType = 'wave' | 'workout_reminder' | 'cheer_streak' | 'rest_day'

export interface FriendNudge {
  id: number
  type: NudgeType
  readAt?: string | null
  createdAt: string
  fromUser: FriendUser
}

export async function sendFriendNudge(
  token: string,
  friendId: number,
  type: NudgeType,
): Promise<{ nudge: { id: number; type: NudgeType; createdAt: string } }> {
  return request(apiUrl('/api/friends/nudge'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ friendId, type }),
  })
}

export async function getFriendNudges(token: string): Promise<{ nudges: FriendNudge[] }> {
  return request<{ nudges: FriendNudge[] }>(apiUrl('/api/friends/nudges'), {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function markFriendNudgesRead(
  token: string,
  nudgeIds?: number[],
): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(apiUrl('/api/friends/nudges/read'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nudgeIds }),
  })
}

export async function clearFriendNudges(token: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(apiUrl('/api/friends/nudges'), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function setFriendNotificationMute(
  token: string,
  friendId: number,
  muted: boolean,
): Promise<{ friendId: number; muted: boolean }> {
  return request<{ friendId: number; muted: boolean }>(apiUrl('/api/friends/mute'), {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ friendId, muted }),
  })
}

export async function lookupFoodByBarcode(
  token: string,
  scanValue: string,
): Promise<{ food: import('../types/nutrition').FoodItem & { suggestedServingGrams?: number } }> {
  return request(
    apiUrl(`/api/food/barcode?code=${encodeURIComponent(scanValue.trim())}`),
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )
}

export async function searchFoodOnline(
  token: string,
  query: string,
): Promise<{ foods: import('../types/nutrition').FoodItem[] }> {
  return request(apiUrl(`/api/food/search?q=${encodeURIComponent(query.trim())}`), {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function getVapidPublicKey(): Promise<{ publicKey: string | null }> {
  return request<{ publicKey: string | null }>(apiUrl('/api/push/vapid-public-key'))
}

export async function subscribePush(
  token: string,
  subscription: PushSubscriptionJSON,
): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(apiUrl('/api/push/subscribe'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ subscription }),
  })
}

export async function unsubscribePush(
  token: string,
  endpoint: string,
): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(
    apiUrl(`/api/push/subscribe?endpoint=${encodeURIComponent(endpoint)}`),
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    },
  )
}
