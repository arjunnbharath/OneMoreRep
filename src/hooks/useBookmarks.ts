import { useCallback, useState } from 'react'

const STORAGE_KEY = 'onemorerep-bookmarks'

function loadBookmarks(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set()
  } catch {
    return new Set()
  }
}

function saveBookmarks(bookmarks: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...bookmarks]))
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Set<string>>(loadBookmarks)

  const toggleBookmark = useCallback((id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      saveBookmarks(next)
      return next
    })
  }, [])

  const isBookmarked = useCallback((id: string) => bookmarks.has(id), [bookmarks])

  return { toggleBookmark, isBookmarked }
}
