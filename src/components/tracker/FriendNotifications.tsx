import { ArrowLeft } from 'lucide-react'
import UserAvatar from '../UserAvatar'
import type { FriendNudge, FriendUser } from '../../lib/api'

function nudgeLabel(type: FriendNudge['type']) {
  switch (type) {
    case 'wave':
      return 'Waved at you'
    case 'workout_reminder':
      return 'Wants to workout'
    case 'cheer_streak':
      return 'Cheered your streak'
    case 'rest_day':
      return 'Checked in on you'
    default:
      return 'Sent a nudge'
  }
}

function formatWhen(iso: string) {
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface FriendNotificationsProps {
  nudges: FriendNudge[]
  loading: boolean
  error: string
  onBack: () => void
  onOpenFriend: (friend: FriendUser) => void
  onWaveBack: (friend: FriendUser) => void
  onMarkRead: (nudgeIds?: number[]) => void
}

export default function FriendNotifications({
  nudges,
  loading,
  error,
  onBack,
  onOpenFriend,
  onWaveBack,
  onMarkRead,
}: FriendNotificationsProps) {
  const hasUnread = nudges.some((nudge) => !nudge.readAt)

  return (
    <div className="desktop-page mx-auto max-w-lg space-y-3 lg:max-w-2xl">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        {hasUnread && (
          <button
            type="button"
            onClick={() => onMarkRead()}
            className="text-xs text-muted transition hover:text-foreground"
          >
            Mark all read
          </button>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold tracking-tight">Recent notifications</h3>
        <p className="mt-0.5 text-sm text-muted">Waves and nudges from friends</p>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-surface px-4 py-8 text-center text-sm text-muted ring-1 ring-border">
          Loading…
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-surface px-4 py-8 text-center text-sm text-red-600 ring-1 ring-border dark:text-red-400">
          {error}
        </div>
      ) : nudges.length === 0 ? (
        <div className="rounded-2xl bg-surface px-4 py-10 text-center ring-1 ring-border">
          <p className="text-sm font-medium">No notifications yet</p>
          <p className="mt-1 text-sm text-muted">When friends wave or nudge you, they&apos;ll show up here.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
          {nudges.map((nudge, index) => {
            const unread = !nudge.readAt
            return (
              <div
                key={nudge.id}
                className={[
                  'flex items-center gap-3 px-4 py-3.5',
                  index > 0 ? 'border-t border-border' : '',
                  unread ? 'bg-background/40' : '',
                ].join(' ')}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (unread) onMarkRead([nudge.id])
                    onOpenFriend(nudge.fromUser)
                  }}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <UserAvatar
                    name={nudge.fromUser.name}
                    avatarUrl={nudge.fromUser.avatarUrl}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{nudge.fromUser.name}</p>
                    <p className="truncate text-xs text-muted">{nudgeLabel(nudge.type)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[11px] text-muted">{formatWhen(nudge.createdAt)}</p>
                    {unread && (
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-foreground" />
                    )}
                  </div>
                </button>
                {nudge.type === 'wave' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (unread) onMarkRead([nudge.id])
                      onWaveBack(nudge.fromUser)
                    }}
                    className="shrink-0 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-medium transition hover:bg-background"
                  >
                    Wave back
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
