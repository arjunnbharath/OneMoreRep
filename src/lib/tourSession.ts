const PENDING_TOUR_KEY = 'onemorerep-pending-tour'
const TOUR_ACTIVE_KEY = 'onemorerep-tour-active'
const TOUR_STEP_KEY = 'onemorerep-tour-step'

export function markPendingTour() {
  sessionStorage.setItem(PENDING_TOUR_KEY, '1')
}

export function hasPendingTour() {
  return sessionStorage.getItem(PENDING_TOUR_KEY) === '1'
}

export function markTourActive(step = 0) {
  sessionStorage.setItem(TOUR_ACTIVE_KEY, '1')
  sessionStorage.setItem(TOUR_STEP_KEY, String(step))
}

export function hasTourActive() {
  return sessionStorage.getItem(TOUR_ACTIVE_KEY) === '1'
}

export function getSavedTourStep() {
  const raw = sessionStorage.getItem(TOUR_STEP_KEY)
  const step = raw ? Number.parseInt(raw, 10) : 0
  return Number.isFinite(step) && step >= 0 ? step : 0
}

export function saveTourStep(step: number) {
  if (!hasTourActive()) return
  sessionStorage.setItem(TOUR_STEP_KEY, String(step))
}

export function clearTourSession() {
  sessionStorage.removeItem(PENDING_TOUR_KEY)
  sessionStorage.removeItem(TOUR_ACTIVE_KEY)
  sessionStorage.removeItem(TOUR_STEP_KEY)
}

export function clearPendingTour() {
  sessionStorage.removeItem(PENDING_TOUR_KEY)
}
