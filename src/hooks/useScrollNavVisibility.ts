import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

const SCROLL_THRESHOLD = 10
const TOP_OFFSET = 32

export function useScrollNavVisibility() {
  const [visible, setVisible] = useState(true)
  const lastY = useRef(0)
  const { pathname } = useLocation()

  useEffect(() => {
    setVisible(true)
    lastY.current = window.scrollY
  }, [pathname])

  useEffect(() => {
    lastY.current = window.scrollY

    function onScroll() {
      const currentY = window.scrollY
      const delta = currentY - lastY.current

      if (currentY <= TOP_OFFSET) {
        setVisible(true)
      } else if (delta > SCROLL_THRESHOLD) {
        setVisible(false)
      } else if (delta < -SCROLL_THRESHOLD) {
        setVisible(true)
      }

      lastY.current = currentY
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return visible
}
