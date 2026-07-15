import { getUserData, putUserData } from './api'
import type { UserDataKey } from './userDataKeys'

let cachedUserId: number | null = null
let cachedStore: Record<string, unknown> | null = null
let inflight: Promise<Record<string, unknown>> | null = null

const pendingSaves = new Map<string, ReturnType<typeof setTimeout>>()

function scopedLocalKey(userId: number, key: UserDataKey) {
  return `onemorerep:${userId}:${key}`
}

function readLocal<T>(storageKey: string): T | null {
  try {
    const raw = localStorage.getItem(storageKey)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function clearUserDataCache() {
  cachedUserId = null
  cachedStore = null
  inflight = null
  for (const timer of pendingSaves.values()) clearTimeout(timer)
  pendingSaves.clear()
}

async function ensureRemoteStore(userId: number, token: string) {
  if (cachedUserId === userId && cachedStore) return cachedStore
  if (inflight) return inflight

  inflight = getUserData(token)
    .then(({ data }) => {
      cachedUserId = userId
      cachedStore = data
      inflight = null
      return data
    })
    .catch(() => {
      inflight = null
      cachedUserId = userId
      cachedStore = {}
      return {}
    })

  return inflight
}

export async function loadUserDataValue<T>(
  userId: number,
  token: string,
  key: UserDataKey,
  fallback: T,
  legacyLocalKey?: string,
): Promise<T> {
  const store = await ensureRemoteStore(userId, token)
  const localKey = scopedLocalKey(userId, key)

  if (store[key] !== undefined && store[key] !== null) {
    const value = store[key] as T
    localStorage.setItem(localKey, JSON.stringify(value))
    return value
  }

  const localValue = readLocal<T>(localKey)
  if (localValue !== null) {
    scheduleUserDataSave(userId, token, key, localValue)
    return localValue
  }

  if (legacyLocalKey) {
    const legacy = readLocal<T>(legacyLocalKey)
    if (legacy !== null) {
      localStorage.setItem(localKey, JSON.stringify(legacy))
      scheduleUserDataSave(userId, token, key, legacy)
      return legacy
    }
  }

  return fallback
}

export function scheduleUserDataSave<T>(
  userId: number,
  token: string,
  key: UserDataKey,
  data: T,
) {
  const localKey = scopedLocalKey(userId, key)
  localStorage.setItem(localKey, JSON.stringify(data))

  if (cachedStore) cachedStore[key] = data as unknown

  const pendingKey = `${userId}:${key}`
  const existing = pendingSaves.get(pendingKey)
  if (existing) clearTimeout(existing)

  pendingSaves.set(
    pendingKey,
    setTimeout(() => {
      pendingSaves.delete(pendingKey)
      void putUserData(token, key, data).catch((err) => {
        console.error(`Failed to sync ${key}:`, err)
      })
    }, 700),
  )
}
