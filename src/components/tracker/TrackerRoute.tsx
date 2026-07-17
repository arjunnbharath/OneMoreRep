import { Navigate, useLocation } from 'react-router-dom'
import FriendDetail from './FriendDetail'
import FriendNotificationsPage from './FriendNotificationsPage'
import Tracker from '../../pages/Tracker'
import { getFriendIdFromPath, parseTrackerRoute } from '../../lib/trackerPaths'

export default function TrackerRoute() {
  const location = useLocation()
  const route = parseTrackerRoute(location.pathname)
  const friendId = getFriendIdFromPath(location.pathname)

  if (route.kind === 'redirect') {
    return <Navigate to={route.to} replace />
  }

  if (friendId !== null) {
    return <FriendDetail friendId={friendId} />
  }

  if (route.kind === 'friends' && route.notifications) {
    return <FriendNotificationsPage />
  }

  return <Tracker />
}
