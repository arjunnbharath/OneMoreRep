import { useCallback, useEffect, useState } from 'react'
import { getFriendsActivity, type FriendActivityItem } from '../lib/api'
import { useAuth } from '../context/AuthContext'

const CACHE_KEY = 'onemorerep-friends-activity'

function readCache(): FriendActivityItem[] {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as FriendActivityItem[]) : []
  } catch {
    return []
  }
}

function writeCache(items: FriendActivityItem[]) {
  sessionStorage.setItem(CACHE_KEY, JSON.stringify(items))
}

export function useFriendsActivity(limit = 12) {
  const { token } = useAuth()
  const [items, setItems] = useState<FriendActivityItem[]>(() => readCache())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!token) {
      setItems([])
      setLoading(false)
      return
    }

    if (!navigator.onLine) {
      setItems(readCache())
      setLoading(false)
      return
    }

    setError('')
    try {
      const { items: nextItems } = await getFriendsActivity(token, limit)
      setItems(nextItems)
      writeCache(nextItems)
    } catch (err) {
      const cached = readCache()
      setItems(cached)
      if (cached.length === 0) {
        setError(err instanceof Error ? err.message : 'Failed to load activity')
      }
    } finally {
      setLoading(false)
    }
  }, [token, limit])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    function handleOnline() {
      void refresh()
    }
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [refresh])

  return { items, loading, error, refresh }
}
