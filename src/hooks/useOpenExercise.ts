import { useCallback } from 'react'
import { useLocation, useNavigate, type Location } from 'react-router-dom'

export interface SheetLocationState {
  backgroundLocation?: Location
}

/** The exercise page uses a two-column layout on desktop, so it only becomes a sheet below `lg`. */
function prefersSheet() {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches
}

/** Opens an exercise guide as a bottom sheet over the current page on phones. */
export function useOpenExercise() {
  const navigate = useNavigate()
  const location = useLocation()

  return useCallback(
    (id: string, state?: Record<string, unknown>) => {
      navigate(`/exercises/${id}`, {
        state: prefersSheet() ? { ...state, backgroundLocation: location } : state,
      })
    },
    [navigate, location],
  )
}
