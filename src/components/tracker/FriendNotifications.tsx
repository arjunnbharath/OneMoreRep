import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import UserAvatar from '../UserAvatar'
import type { FriendNudge, FriendUser } from '../../lib/api'

function nudgeText(type: FriendNudge['type']) {
  switch (type) {
    case 'wave':
      return 'waved at you'
    case 'workout_reminder':
      return 'wants to workout'
    case 'cheer_streak':
      return 'cheered your streak'
    case 'rest_day':
      return 'checked in'
    default:
      return 'sent a nudge'
  }
}

function formatWhen(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface FriendNotificationsProps {
  nudges: FriendNudge[]
  loading: boolean
  error: string
  clearing: boolean
  onBack: () => void
  onOpenFriend: (friend: FriendUser) => void
  onWaveBack: (friend: FriendUser) => void
  onMarkRead: (nudgeIds?: number[]) => void
  onClearAll: () => void
}

export default function FriendNotifications({
  nudges,
  loading,
  error,
  clearing,
  onBack,
  onOpenFriend,
  onWaveBack,
  onMarkRead,
  onClearAll,
}: FriendNotificationsProps) {
  const [confirmClear, setConfirmClear] = useState(false)
  const unreadCount = nudges.filter((nudge) => !nudge.readAt).length

  function handleClearAll() {
    if (!confirmClear) {
      setConfirmClear(true)
      return
    }
    onClearAll()
    setConfirmClear(false)
  }

  return (
    <div className="min-h-full bg-background text-foreground lg:mx-auto lg:max-w-3xl">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-sm lg:px-10 lg:py-5">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to friends"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted transition hover:bg-surface hover:text-foreground"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold">Notifications</h1>
        {!loading && !error && nudges.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            disabled={clearing}
            className={[
              'ml-auto shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition disabled:opacity-50',
              confirmClear
                ? 'bg-red-700 hover:bg-red-800'
                : 'bg-red-600 hover:bg-red-700',
            ].join(' ')}
          >
            {clearing ? 'Deleting…' : confirmClear ? 'Tap again' : 'Delete all'}
          </button>
        )}
      </header>

      <div className="desktop-page-body mx-auto max-w-lg px-5 py-4 lg:max-w-none lg:px-10 lg:pb-10">
        {loading ? (
          <p className="py-8 text-center text-sm text-muted">Loading…</p>
        ) : error ? (
          <p className="py-8 text-center text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : nudges.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted">No notifications</p>
        ) : (
          <>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => onMarkRead()}
                className="mb-3 text-xs text-muted transition hover:text-foreground"
              >
                Mark all read
              </button>
            )}
            <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
              {nudges.map((nudge, index) => {
                const unread = !nudge.readAt
                const firstName = nudge.fromUser.name.split(' ')[0]

                return (
                  <div
                    key={nudge.id}
                    className={[
                      'flex items-center gap-3 px-3 py-3',
                      index > 0 ? 'border-t border-border' : '',
                    ].join(' ')}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (unread) onMarkRead([nudge.id])
                        onOpenFriend(nudge.fromUser)
                      }}
                      className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                    >
                      <UserAvatar
                        name={nudge.fromUser.name}
                        avatarUrl={nudge.fromUser.avatarUrl}
                        size="sm"
                      />
                      <p className="min-w-0 flex-1 text-sm leading-snug">
                        <span className="font-medium">{firstName}</span>{' '}
                        <span className="text-muted">{nudgeText(nudge.type)}</span>
                      </p>
                      <span className="shrink-0 text-[11px] tabular-nums text-muted">
                        {formatWhen(nudge.createdAt)}
                      </span>
                      {unread && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />
                      )}
                    </button>
                    {nudge.type === 'wave' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (unread) onMarkRead([nudge.id])
                          onWaveBack(nudge.fromUser)
                        }}
                        className="shrink-0 text-[11px] font-medium text-muted transition hover:text-foreground"
                      >
                        Wave
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
