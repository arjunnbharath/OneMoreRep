import { getUserData, putUserData } from './api'
import { USER_DATA_KEYS, type UserDataKey } from './userDataKeys'

let cachedUserId: number | null = null
let cachedStore: Record<string, unknown> | null = null
let inflight: Promise<Record<string, unknown>> | null = null

const pendingSaves = new Map<string, ReturnType<typeof setTimeout>>()
const SYNC_QUEUE_KEY = 'onemorerep-sync-queue'

type QueuedSave = {
  userId: number
  key: UserDataKey
  data: unknown
  timestamp: number
}

const syncListeners = new Set<() => void>()

function notifySyncStatus() {
  for (const listener of syncListeners) {
    listener()
  }
}

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

function readSyncQueue(): QueuedSave[] {
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY)
    return raw ? (JSON.parse(raw) as QueuedSave[]) : []
  } catch {
    return []
  }
}

function writeSyncQueue(queue: QueuedSave[]) {
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue))
  notifySyncStatus()
}

function queueFailedSave(userId: number, key: UserDataKey, data: unknown) {
  const queue = readSyncQueue().filter((item) => !(item.userId === userId && item.key === key))
  queue.push({ userId, key, data, timestamp: Date.now() })
  writeSyncQueue(queue)
}

export function isOnline() {
  return typeof navigator === 'undefined' ? true : navigator.onLine
}

export function getPendingSyncCount() {
  return readSyncQueue().length
}

export function subscribeSyncStatus(listener: () => void) {
  syncListeners.add(listener)
  return () => {
    syncListeners.delete(listener)
  }
}

export function clearUserDataCache() {
  cachedUserId = null
  cachedStore = null
  inflight = null
  for (const timer of pendingSaves.values()) clearTimeout(timer)
  pendingSaves.clear()
}

const LEGACY_LOCAL_KEYS = [
  'onemorerep-tracker',
  'onemorerep-active-session',
  'onemorerep-nutrition-profile',
  'onemorerep-food-logs',
  'onemorerep-custom-foods',
  'onemorerep-bookmarks',
] as const

export function clearLocalUserData(userId: number) {
  for (const key of Object.values(USER_DATA_KEYS)) {
    localStorage.removeItem(scopedLocalKey(userId, key))
  }
  for (const key of LEGACY_LOCAL_KEYS) {
    localStorage.removeItem(key)
  }
  const queue = readSyncQueue().filter((item) => item.userId !== userId)
  writeSyncQueue(queue)
  clearUserDataCache()
}

async function ensureRemoteStore(userId: number, token: string) {
  if (!isOnline()) {
    if (cachedUserId === userId && cachedStore) return cachedStore
    cachedUserId = userId
    cachedStore = cachedStore ?? {}
    return cachedStore
  }

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
      cachedStore = cachedStore ?? {}
      return cachedStore ?? {}
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
  const localKey = scopedLocalKey(userId, key)
  const localValue = readLocal<T>(localKey)

  if (!isOnline()) {
    if (localValue !== null) return localValue
    return fallback
  }

  const store = await ensureRemoteStore(userId, token)

  if (store[key] !== undefined && store[key] !== null) {
    const value = store[key] as T
    localStorage.setItem(localKey, JSON.stringify(value))
    return value
  }

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

async function persistRemote(
  userId: number,
  token: string,
  key: UserDataKey,
  data: unknown,
) {
  if (!isOnline()) {
    queueFailedSave(userId, key, data)
    return
  }

  try {
    await putUserData(token, key, data)
    const queue = readSyncQueue().filter((item) => !(item.userId === userId && item.key === key))
    writeSyncQueue(queue)
  } catch (err) {
    console.error(`Failed to sync ${key}:`, err)
    queueFailedSave(userId, key, data)
  }
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
      void persistRemote(userId, token, key, data)
    }, 700),
  )
}

export async function flushSyncQueue(userId: number, token: string) {
  if (!isOnline()) return

  const queue = readSyncQueue().filter((item) => item.userId === userId)
  if (queue.length === 0) return

  const remaining: QueuedSave[] = readSyncQueue().filter((item) => item.userId !== userId)

  for (const item of queue) {
    try {
      await putUserData(token, item.key, item.data)
      if (cachedStore) cachedStore[item.key] = item.data
    } catch (err) {
      console.error(`Failed to flush sync for ${item.key}:`, err)
      remaining.push(item)
    }
  }

  const otherUsers = readSyncQueue().filter((item) => item.userId !== userId)
  writeSyncQueue([...otherUsers, ...remaining])
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    notifySyncStatus()
  })
}
