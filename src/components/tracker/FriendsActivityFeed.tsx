import { useNavigate } from 'react-router-dom'
import { Activity, ChevronRight } from 'lucide-react'
import UserAvatar from '../UserAvatar'
import { useFriendsActivity } from '../../hooks/useFriendsActivity'
import { formatRelativeTime } from '../../lib/friendInsights'
import { getSessionDurationSeconds, sessionVolume } from '../../lib/workoutProgress'
import { TRACKER_PATHS } from '../../lib/trackerPaths'

export default function FriendsActivityFeed() {
  const navigate = useNavigate()
  const { items, loading, error } = useFriendsActivity(8)

  if (loading && items.length === 0) {
    return (
      <div className="rounded-2xl bg-surface px-4 py-5 text-center text-sm text-muted ring-1 ring-border">
        Loading activity…
      </div>
    )
  }

  if (items.length === 0) {
    if (error) return null
    return (
      <div className="rounded-2xl bg-surface px-4 py-5 text-center ring-1 ring-border">
        <Activity size={20} className="mx-auto text-muted" />
        <p className="mt-2 text-sm text-muted">Friend workouts will show up here</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-0.5">
        <Activity size={15} className="text-muted" />
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">Recent activity</h4>
      </div>
      <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
        {items.map((item, index) => {
          const { session, friend } = item
          const vol = sessionVolume(session)
          const mins = Math.floor(getSessionDurationSeconds(session) / 60)
          const details = [
            vol > 0 ? `${vol.toLocaleString()} kg` : null,
            mins > 0 ? `${mins} min` : null,
          ]
            .filter(Boolean)
            .join(' · ')

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(TRACKER_PATHS.friend(friend.id))}
              className={[
                'flex w-full items-center gap-3 px-3 py-3 text-left transition hover:bg-surface-elevated/50',
                index > 0 ? 'border-t border-border' : '',
              ].join(' ')}
            >
              <UserAvatar name={friend.name} avatarUrl={friend.avatarUrl} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">
                  <span className="font-medium">{friend.name}</span>
                  <span className="text-muted"> logged </span>
                  <span className="font-medium">{session.name}</span>
                </p>
                <p className="truncate text-xs text-muted">
                  {details || `${session.exercises.length} exercises`}
                  {' · '}
                  {formatRelativeTime(session.completedAt ?? session.date)}
                </p>
              </div>
              <ChevronRight size={16} className="shrink-0 text-muted" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
