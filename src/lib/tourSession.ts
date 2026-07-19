const PENDING_TOUR_KEY = 'onemorerep-pending-tour'

export function markPendingTour() {
  sessionStorage.setItem(PENDING_TOUR_KEY, '1')
}

export function hasPendingTour() {
  return sessionStorage.getItem(PENDING_TOUR_KEY) === '1'
}

export function clearPendingTour() {
  sessionStorage.removeItem(PENDING_TOUR_KEY)
}
