import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { restoreScrollPosition } from '../lib/scrollRestore'

export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if (navigationType === 'POP') {
      const restored = restoreScrollPosition(pathname, search, hash)
      if (restored) return
    }

    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [pathname, search, hash, navigationType])

  return null
}
