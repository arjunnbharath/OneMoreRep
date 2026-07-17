import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FriendNotifications from './FriendNotifications'
import { useFriends } from '../../hooks/useFriends'
import { useFriendNudges } from '../../hooks/useFriendNudges'
import { TRACKER_PATHS } from '../../lib/trackerPaths'
import type { FriendUser } from '../../lib/api'

export default function FriendNotificationsPage() {
  const navigate = useNavigate()
  const { friends } = useFriends()
  const { nudges, loading, error, sendNudge, markRead, clearAll } = useFriendNudges()
  const [clearing, setClearing] = useState(false)

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

  async function handleClearAll() {
    setClearing(true)
    try {
      await clearAll()
    } finally {
      setClearing(false)
    }
  }

  return (
    <FriendNotifications
      nudges={visibleNudges}
      loading={loading}
      error={error}
      clearing={clearing}
      onBack={() => navigate(TRACKER_PATHS.friends)}
      onOpenFriend={openFriend}
      onWaveBack={(friend) => void handleWaveBack(friend)}
      onMarkRead={(ids) => void markRead(ids)}
      onClearAll={() => void handleClearAll()}
    />
  )
}
