import type { User } from './api'

/**
 * Local ("on this device") accounts never talk to the server.
 * They use a sentinel token so existing hooks that gate on `token`
 * keep working, while `userDataSync` skips every remote call.
 */
export const LOCAL_TOKEN = 'local'
export const LOCAL_USER_ID = -1

const LOCAL_PROFILE_KEY = 'onemorerep-local-profile'

export type StorageMode = 'local' | 'cloud'

export function isLocalToken(token: string | null | undefined): boolean {
  return token === LOCAL_TOKEN
}

export function readLocalProfile(): User | null {
  try {
    const raw = localStorage.getItem(LOCAL_PROFILE_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export function writeLocalProfile(user: User) {
  localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(user))
}

export function removeLocalProfile() {
  localStorage.removeItem(LOCAL_PROFILE_KEY)
}

export function createLocalUser(name: string): User {
  const user: User = {
    id: LOCAL_USER_ID,
    name: name.trim(),
    email: '',
    username: null,
    avatarUrl: null,
    createdAt: new Date().toISOString(),
    hasAdminAccess: false,
  }
  writeLocalProfile(user)
  return user
}

/** A guest can use the app with no account. An existing device profile is kept as-is. */
export function createGuestUser(): User {
  const existing = readLocalProfile()
  if (existing) return existing

  const user: User = {
    id: LOCAL_USER_ID,
    name: 'Guest',
    email: '',
    username: null,
    avatarUrl: null,
    createdAt: new Date().toISOString(),
    hasAdminAccess: false,
    isGuest: true,
  }
  writeLocalProfile(user)
  return user
}
