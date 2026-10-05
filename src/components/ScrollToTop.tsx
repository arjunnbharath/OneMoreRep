import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { restoreScrollPosition } from '../lib/scrollRestore'
import type { SheetLocationState } from '../hooks/useOpenExercise'

export default function ScrollToTop() {
  const location = useLocation()
  const { pathname, search, hash } = location
  const navigationType = useNavigationType()
  const isSheet = Boolean((location.state as SheetLocationState | null)?.backgroundLocation)
  const wasSheet = useRef(isSheet)

  useEffect(() => {
    const leavingSheet = wasSheet.current
    wasSheet.current = isSheet
    // Sheets open over the current page, so the page underneath keeps its scroll.
    if (isSheet || (leavingSheet && navigationType === 'POP')) return

    if (navigationType === 'POP') {
      const restored = restoreScrollPosition(pathname, search, hash)
      if (restored) return
    }

    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [pathname, search, hash, navigationType, isSheet])

  return null
}
