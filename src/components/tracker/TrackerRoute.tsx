import { useLocation } from 'react-router-dom'
import FriendDetail from './FriendDetail'
import Tracker from '../../pages/Tracker'
import { getFriendIdFromPath } from '../../lib/trackerPaths'

export default function TrackerRoute() {
  const location = useLocation()
  const friendId = getFriendIdFromPath(location.pathname)

  if (friendId !== null) {
    return <FriendDetail friendId={friendId} />
  }

  return <Tracker />
}
