import {
  ArrowLeft,
  Bell,
  Dumbbell,
  Hand,
  Heart,
  Moon,
} from 'lucide-react'
import UserAvatar from '../UserAvatar'
import type { FriendNudge, FriendUser } from '../../lib/api'

function nudgeMeta(type: FriendNudge['type']) {
  switch (type) {
    case 'wave':
      return { label: 'Waved at you', icon: Hand }
    case 'workout_reminder':
      return { label: 'Wants to workout', icon: Dumbbell }
    case 'cheer_streak':
      return { label: 'Cheered your streak', icon: Heart }
    case 'rest_day':
      return { label: 'Checked in on you', icon: Moon }
    default:
      return { label: 'Sent a nudge', icon: Bell }
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
  const unreadCount = nudges.filter((nudge) => !nudge.readAt).length

  return (
    <div className="min-h-full bg-background text-foreground lg:mx-auto lg:max-w-3xl">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-sm lg:desktop-page-header lg:static lg:px-10 lg:py-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to friends"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted transition hover:bg-surface hover:text-foreground"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0">
            <p className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-muted lg:block">
              Friends
            </p>
            <h1 className="truncate text-lg font-semibold lg:text-2xl lg:tracking-tight">
              Notifications
            </h1>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => onMarkRead()}
            className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted transition hover:bg-surface hover:text-foreground"
          >
            Mark all read
          </button>
        )}
      </header>

      <div className="desktop-page-body mx-auto max-w-lg space-y-4 px-5 py-6 lg:max-w-none lg:px-10 lg:pb-10">
        {!loading && !error && nudges.length > 0 && (
          <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3 ring-1 ring-border">
            <div>
              <p className="text-sm font-medium">Last 7 days</p>
              <p className="mt-0.5 text-xs text-muted">
                {unreadCount > 0
                  ? `${unreadCount} unread · ${nudges.length} total`
                  : `${nudges.length} notification${nudges.length === 1 ? '' : 's'}`}
              </p>
            </div>
            {unreadCount > 0 && (
              <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-foreground px-2 text-xs font-semibold text-background">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-2xl bg-surface p-4 ring-1 ring-border"
              >
                <div className="h-11 w-11 animate-pulse rounded-full bg-background" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-28 animate-pulse rounded bg-background" />
                  <div className="h-3 w-20 animate-pulse rounded bg-background" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-surface px-4 py-10 text-center text-sm text-red-600 ring-1 ring-border dark:text-red-400">
            {error}
          </div>
        ) : nudges.length === 0 ? (
          <div className="rounded-2xl bg-surface px-6 py-14 text-center ring-1 ring-border">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-background ring-1 ring-border">
              <Bell size={20} className="text-muted" />
            </span>
            <p className="mt-4 text-sm font-medium">No notifications yet</p>
            <p className="mt-1 text-sm text-muted">
              When friends wave or nudge you, they&apos;ll show up here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {nudges.map((nudge) => {
              const unread = !nudge.readAt
              const { label, icon: Icon } = nudgeMeta(nudge.type)

              return (
                <article
                  key={nudge.id}
                  className={[
                    'overflow-hidden rounded-2xl bg-surface ring-1 ring-border transition',
                    unread ? 'ring-foreground/15' : '',
                  ].join(' ')}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (unread) onMarkRead([nudge.id])
                      onOpenFriend(nudge.fromUser)
                    }}
                    className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-surface-elevated/40"
                  >
                    <div className="relative shrink-0">
                      <UserAvatar
                        name={nudge.fromUser.name}
                        avatarUrl={nudge.fromUser.avatarUrl}
                        size="md"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-background ring-1 ring-border">
                        <Icon size={10} className="text-muted" />
                      </span>
                    </div>

                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-semibold">{nudge.fromUser.name}</p>
                        <span className="shrink-0 text-[11px] text-muted">
                          {formatWhen(nudge.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-muted">{label}</p>
                    </div>

                    {unread && (
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-foreground" />
                    )}
                  </button>

                  {nudge.type === 'wave' && (
                    <div className="border-t border-border px-4 py-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (unread) onMarkRead([nudge.id])
                          onWaveBack(nudge.fromUser)
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-background py-2 text-xs font-medium transition hover:ring-1 hover:ring-border"
                      >
                        <Hand size={14} />
                        Wave back
                      </button>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
