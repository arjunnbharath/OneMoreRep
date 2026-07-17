import { useNavigate } from 'react-router-dom'
import FriendNotifications from './FriendNotifications'
import { useFriends } from '../../hooks/useFriends'
import { useFriendNudges } from '../../hooks/useFriendNudges'
import { TRACKER_PATHS } from '../../lib/trackerPaths'
import type { FriendUser } from '../../lib/api'

export default function FriendNotificationsPage() {
  const navigate = useNavigate()
  const { friends } = useFriends()
  const { nudges, loading, error, sendNudge, markRead } = useFriendNudges()

  const mutedFriendIds = new Set(
    friends.filter((friend) => friend.notificationsMuted).map((friend) => friend.id),
  )
  const visibleNudges = nudges.filter((nudge) => !mutedFriendIds.has(nudge.fromUser.id))

  function openFriend(friend: FriendUser) {
    navigate(TRACKER_PATHS.friend(friend.id))
  }

  async function handleWaveBack(friend: FriendUser) {
    try {
      await sendNudge(friend.id, 'wave')
    } catch {
      // ignore
    }
  }

  return (
    <FriendNotifications
      nudges={visibleNudges}
      loading={loading}
      error={error}
      onBack={() => navigate(TRACKER_PATHS.friends)}
      onOpenFriend={openFriend}
      onWaveBack={(friend) => void handleWaveBack(friend)}
      onMarkRead={(ids) => void markRead(ids)}
    />
  )
}
