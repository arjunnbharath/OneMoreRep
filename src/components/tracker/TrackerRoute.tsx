import { Navigate, useLocation } from 'react-router-dom'
import FriendDetail from './FriendDetail'
import FriendNotificationsPage from './FriendNotificationsPage'
import Tracker from '../../pages/Tracker'
import { useAuth } from '../../context/AuthContext'
import { getFriendIdFromPath, parseTrackerRoute, TRACKER_PATHS } from '../../lib/trackerPaths'

export default function TrackerRoute() {
  const location = useLocation()
  const { isLocal } = useAuth()
  const route = parseTrackerRoute(location.pathname)
  const friendId = getFriendIdFromPath(location.pathname)

  if (route.kind === 'redirect') {
    return <Navigate to={route.to} replace />
  }

  // Friends is only available for online accounts.
  if (route.kind === 'friends' && isLocal) {
    return <Navigate to={TRACKER_PATHS.plan} replace />
  }

  if (friendId !== null) {
    return <FriendDetail friendId={friendId} />
  }

  if (route.kind === 'friends' && route.notifications) {
    return <FriendNotificationsPage />
  }

  return <Tracker />
}
