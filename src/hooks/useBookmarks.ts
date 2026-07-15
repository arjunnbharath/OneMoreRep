import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { USER_DATA_KEYS } from '../lib/userDataKeys'
import { loadUserDataValue, scheduleUserDataSave } from '../lib/userDataSync'

const LEGACY_BOOKMARKS_KEY = 'onemorerep-bookmarks'

export function useBookmarks() {
  const { user, token } = useAuth()
  const userId = user?.id

  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())
  const [ready, setReady] = useState(false)
  const activeUserRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!userId || !token) {
      setBookmarks(new Set())
      setReady(false)
      activeUserRef.current = undefined
      return
    }

    let cancelled = false
    setReady(false)
    activeUserRef.current = userId

    loadUserDataValue<string[]>(
      userId,
      token,
      USER_DATA_KEYS.bookmarks,
      [],
      LEGACY_BOOKMARKS_KEY,
    ).then((ids) => {
      if (cancelled || activeUserRef.current !== userId) return
      setBookmarks(new Set(ids))
      setReady(true)
    })

    return () => {
      cancelled = true
    }
  }, [userId, token])

  useEffect(() => {
    if (!userId || !token || !ready) return
    scheduleUserDataSave(userId, token, USER_DATA_KEYS.bookmarks, [...bookmarks])
  }, [bookmarks, userId, token, ready])

  const toggleBookmark = useCallback((id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const isBookmarked = useCallback((id: string) => bookmarks.has(id), [bookmarks])

  return { toggleBookmark, isBookmarked }
}
