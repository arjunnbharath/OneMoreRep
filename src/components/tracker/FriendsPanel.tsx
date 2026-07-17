import { useState, type FormEvent, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, BellOff, ChevronRight, Hand, UserPlus, Users, X } from 'lucide-react'
import UserAvatar from '../UserAvatar'
import { useFriends } from '../../hooks/useFriends'
import { useFriendNudges } from '../../hooks/useFriendNudges'
import { usePushNotifications } from '../../hooks/usePushNotifications'
import { TRACKER_PATHS } from '../../lib/trackerPaths'
import type { FriendUser } from '../../lib/api'

export default function FriendsPanel() {
  const navigate = useNavigate()
  const { friends, loading, error, addFriend } = useFriends()
  const { nudges, unreadNudges, sendNudge } = useFriendNudges()
  const { supported: pushSupported, available: pushAvailable, permission, enabling, enable } =
    usePushNotifications()
  const [showAddForm, setShowAddForm] = useState(false)
  const [username, setUsername] = useState('')
  const [addError, setAddError] = useState('')
  const [adding, setAdding] = useState(false)
  const [wavingId, setWavingId] = useState<number | null>(null)

  const showEnablePush =
    pushSupported && pushAvailable && permission !== 'granted' && permission !== 'denied'

  const mutedFriendIds = new Set(
    friends.filter((friend) => friend.notificationsMuted).map((friend) => friend.id),
  )
  const visibleNudges = nudges.filter((nudge) => !mutedFriendIds.has(nudge.fromUser.id))
  const visibleUnreadCount = unreadNudges.filter(
    (nudge) => !mutedFriendIds.has(nudge.fromUser.id),
  ).length

  function closeAddForm() {
    setShowAddForm(false)
    setUsername('')
    setAddError('')
  }

  async function handleAddFriend(e: FormEvent) {
    e.preventDefault()
    setAddError('')
    setAdding(true)

    try {
      const friend = await addFriend(username)
      setUsername('')
      setShowAddForm(false)
      navigate(TRACKER_PATHS.friend(friend.id))
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add friend')
    } finally {
      setAdding(false)
    }
  }

  function openFriend(friend: FriendUser) {
    navigate(TRACKER_PATHS.friend(friend.id))
  }

  async function handleQuickWave(e: MouseEvent, friend: FriendUser) {
    e.stopPropagation()
    setWavingId(friend.id)
    try {
      await sendNudge(friend.id, 'wave')
    } finally {
      setWavingId(null)
    }
  }

  return (
    <div className="desktop-page mx-auto max-w-lg space-y-3 lg:max-w-2xl">
      {showEnablePush && (
        <div className="rounded-xl bg-surface px-3 py-2.5 ring-1 ring-border">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <Bell size={15} className="shrink-0 text-muted" />
              <p className="text-xs text-muted">Get alerts when friends nudge you</p>
            </div>
            <button
              type="button"
              onClick={() => void enable()}
              disabled={enabling}
              className="shrink-0 rounded-lg border border-border px-2.5 py-1 text-xs font-medium transition hover:bg-background disabled:opacity-50"
            >
              {enabling ? '…' : 'Enable'}
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-muted" />
          <h3 className="text-sm font-semibold">Friends</h3>
        </div>
        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-1.5 rounded-lg px-1 py-1 text-xs text-muted transition hover:text-foreground"
          >
            <UserPlus size={15} />
            <span>Add friend</span>
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleAddFriend} className="rounded-xl bg-surface p-2 ring-1 ring-border">
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="User ID"
              autoComplete="off"
              required
              minLength={3}
              maxLength={20}
              pattern="[A-Za-z0-9_]{3,20}"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="min-w-0 flex-1 rounded-lg bg-background px-3 py-1.5 text-sm outline-none ring-1 ring-border placeholder:text-muted focus:ring-foreground/30"
            />
            <button
              type="submit"
              disabled={adding}
              className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-background disabled:opacity-50"
            >
              {adding ? '…' : 'Add'}
            </button>
            <button
              type="button"
              onClick={closeAddForm}
              disabled={adding}
              aria-label="Cancel"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-background hover:text-foreground"
            >
              <X size={15} />
            </button>
          </div>
          {addError && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">{addError}</p>
          )}
        </form>
      )}

      {loading ? (
        <div className="rounded-2xl bg-surface px-4 py-6 text-center text-sm text-muted ring-1 ring-border">
          Loading…
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-surface px-4 py-6 text-center text-sm text-red-600 ring-1 ring-border dark:text-red-400">
          {error}
        </div>
      ) : friends.length === 0 ? (
        <div className="rounded-2xl bg-surface px-4 py-6 text-center ring-1 ring-border">
          <p className="text-sm text-muted">No friends yet</p>
          {!showAddForm && (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="mt-2 text-xs text-muted underline-offset-2 hover:text-foreground hover:underline"
            >
              Add friend
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
          {friends.map((friend, index) => (
            <div key={friend.id} className={index > 0 ? 'border-t border-border' : ''}>
              <div className="flex items-center gap-2 px-3 py-3">
                <button
                  type="button"
                  onClick={() => openFriend(friend)}
                  className="flex min-w-0 flex-1 items-center gap-2.5 text-left transition hover:opacity-80"
                >
                  <UserAvatar name={friend.name} avatarUrl={friend.avatarUrl} size="sm" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{friend.name}</span>
                  {friend.notificationsMuted && (
                    <BellOff size={14} className="shrink-0 text-muted" aria-label="Notifications muted" />
                  )}
                  <ChevronRight size={16} className="shrink-0 text-muted" />
                </button>
                <button
                  type="button"
                  onClick={(e) => void handleQuickWave(e, friend)}
                  disabled={wavingId === friend.id}
                  aria-label={`Wave at ${friend.name}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-background hover:text-foreground disabled:opacity-50"
                >
                  <Hand size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => navigate(TRACKER_PATHS.friendNotifications)}
        className="flex w-full items-center gap-3 rounded-2xl bg-surface px-4 py-3.5 text-left ring-1 ring-border transition hover:bg-surface-elevated/50"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background ring-1 ring-border">
          <Bell size={16} className="text-muted" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">Recent notifications</span>
          <span className="block text-xs text-muted">
            {visibleUnreadCount > 0
              ? `${visibleUnreadCount} unread`
              : visibleNudges.length > 0
                ? `${visibleNudges.length} total`
                : 'No new activity'}
          </span>
        </span>
        {visibleUnreadCount > 0 && (
          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-foreground px-1.5 text-[10px] font-semibold text-background">
            {visibleUnreadCount > 9 ? '9+' : visibleUnreadCount}
          </span>
        )}
        <ChevronRight size={16} className="shrink-0 text-muted" />
      </button>
    </div>
  )
}
