import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Bell, Dumbbell, Hand, Trash2, UserPlus, Users, X } from 'lucide-react'
import UserAvatar from '../UserAvatar'
import ProgressVolumeChart from './ProgressVolumeChart'
import { useFriends } from '../../hooks/useFriends'
import { useFriendNudges } from '../../hooks/useFriendNudges'
import { usePushNotifications } from '../../hooks/usePushNotifications'
import { getMonthlyProgress, getWeeklyProgress } from '../../lib/workoutProgress'
import type { FriendUser } from '../../lib/api'
import type { WorkoutSession } from '../../types/tracker'

function nudgeLabel(type: string) {
  return type === 'wave' ? 'waved at you' : 'wants to workout'
}

export default function FriendsPanel() {
  const { friends, loading, error, addFriend, removeFriend, loadFriendProgress } = useFriends()
  const { unreadNudges, sendNudge, markRead } = useFriendNudges()
  const { supported: pushSupported, available: pushAvailable, permission, enabling, enable } =
    usePushNotifications()
  const [showAddForm, setShowAddForm] = useState(false)
  const [username, setUsername] = useState('')
  const [addError, setAddError] = useState('')
  const [adding, setAdding] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState<FriendUser | null>(null)
  const [friendSessions, setFriendSessions] = useState<WorkoutSession[]>([])
  const [progressLoading, setProgressLoading] = useState(false)
  const [progressError, setProgressError] = useState('')
  const [removingId, setRemovingId] = useState<number | null>(null)
  const [confirmRemoveId, setConfirmRemoveId] = useState<number | null>(null)
  const [nudgeSending, setNudgeSending] = useState<'wave' | 'workout_reminder' | null>(null)
  const [nudgeError, setNudgeError] = useState('')
  const [nudgeSuccess, setNudgeSuccess] = useState('')

  const weeklyProgress = useMemo(() => getWeeklyProgress(friendSessions), [friendSessions])
  const monthlyProgress = useMemo(() => getMonthlyProgress(friendSessions), [friendSessions])
  const showEnablePush =
    pushSupported && pushAvailable && permission !== 'granted' && permission !== 'denied'

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
      setSelectedFriend(friend)
      setFriendSessions([])
      setProgressError('')
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add friend')
    } finally {
      setAdding(false)
    }
  }

  async function handleSelectFriend(friend: FriendUser) {
    setSelectedFriend(friend)
    setProgressError('')
    setNudgeError('')
    setNudgeSuccess('')
    setProgressLoading(true)

    try {
      const { sessions } = await loadFriendProgress(friend.id)
      setFriendSessions(sessions)
    } catch (err) {
      setFriendSessions([])
      setProgressError(err instanceof Error ? err.message : 'Failed to load progress')
    } finally {
      setProgressLoading(false)
    }
  }

  async function handleRemoveFriend(friendId: number) {
    setRemovingId(friendId)
    try {
      await removeFriend(friendId)
      setConfirmRemoveId(null)
      if (selectedFriend?.id === friendId) {
        setSelectedFriend(null)
        setFriendSessions([])
      }
    } finally {
      setRemovingId(null)
    }
  }

  async function handleSendNudge(type: 'wave' | 'workout_reminder') {
    if (!selectedFriend) return

    setNudgeError('')
    setNudgeSuccess('')
    setNudgeSending(type)

    try {
      await sendNudge(selectedFriend.id, type)
      setNudgeSuccess(type === 'wave' ? 'Wave sent!' : 'Workout reminder sent!')
    } catch (err) {
      setNudgeError(err instanceof Error ? err.message : 'Failed to send')
    } finally {
      setNudgeSending(null)
    }
  }

  async function handleWaveBack(friend: FriendUser) {
    setNudgeError('')
    try {
      await sendNudge(friend.id, 'wave')
      await markRead()
    } catch (err) {
      setNudgeError(err instanceof Error ? err.message : 'Failed to wave back')
    }
  }

  return (
    <div className="desktop-page mx-auto max-w-lg space-y-6 lg:max-w-none lg:grid lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start lg:gap-8">
      <section className="space-y-3">
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

        {unreadNudges.length > 0 && (
          <div className="space-y-2 rounded-xl bg-surface p-3 ring-1 ring-border">
            {unreadNudges.slice(0, 3).map((nudge) => (
              <div key={nudge.id} className="flex items-center gap-2.5">
                <UserAvatar
                  name={nudge.fromUser.name}
                  avatarUrl={nudge.fromUser.avatarUrl}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs">
                    <span className="font-medium">{nudge.fromUser.name}</span>{' '}
                    <span className="text-muted">{nudgeLabel(nudge.type)}</span>
                  </p>
                </div>
                {nudge.type === 'wave' && (
                  <button
                    type="button"
                    onClick={() => void handleWaveBack(nudge.fromUser)}
                    className="shrink-0 rounded-lg border border-border px-2 py-1 text-[11px] transition hover:bg-background"
                  >
                    Wave back
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => void markRead()}
              className="text-[11px] text-muted underline-offset-2 hover:text-foreground hover:underline"
            >
              Dismiss all
            </button>
          </div>
        )}

        <div className="mb-3 flex items-center justify-between gap-3">
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
          <form
            onSubmit={handleAddFriend}
            className="mb-3 rounded-xl bg-surface p-2 ring-1 ring-border"
          >
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
            {friends.map((friend, index) => {
              const selected = selectedFriend?.id === friend.id
              return (
                <div key={friend.id} className={index > 0 ? 'border-t border-border' : ''}>
                  <div className="flex items-center gap-3 px-3 py-3">
                    <button
                      type="button"
                      onClick={() => void handleSelectFriend(friend)}
                      disabled={confirmRemoveId === friend.id}
                      className={[
                        'flex min-w-0 flex-1 items-center gap-2.5 text-left transition',
                        selected ? 'opacity-100' : 'hover:opacity-80',
                        confirmRemoveId === friend.id ? 'opacity-60' : '',
                      ].join(' ')}
                    >
                      <UserAvatar name={friend.name} avatarUrl={friend.avatarUrl} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{friend.name}</span>
                        <span className="block truncate text-xs text-muted">
                          @{friend.username ?? 'unknown'}
                        </span>
                      </span>
                    </button>
                    {confirmRemoveId === friend.id ? (
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <p className="text-[11px] text-muted">Remove friend?</p>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setConfirmRemoveId(null)}
                            disabled={removingId === friend.id}
                            className="rounded-lg border border-border px-2 py-1 text-xs text-muted transition hover:text-foreground"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleRemoveFriend(friend.id)}
                            disabled={removingId === friend.id}
                            className="rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-500/10 disabled:opacity-50 dark:border-red-900/50 dark:text-red-400"
                          >
                            {removingId === friend.id ? '…' : 'Remove'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmRemoveId(friend.id)}
                        aria-label={`Remove ${friend.name}`}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <div className="min-w-0">
        {selectedFriend ? (
          <section className="space-y-4 lg:sticky lg:top-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold">{selectedFriend.name}&apos;s progress</h3>
                <p className="text-sm text-muted">@{selectedFriend.username ?? 'unknown'}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleSendNudge('wave')}
                  disabled={nudgeSending !== null}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-surface disabled:opacity-50"
                >
                  <Hand size={14} />
                  {nudgeSending === 'wave' ? 'Sending…' : 'Wave'}
                </button>
                <button
                  type="button"
                  onClick={() => void handleSendNudge('workout_reminder')}
                  disabled={nudgeSending !== null}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-surface disabled:opacity-50"
                >
                  <Dumbbell size={14} />
                  {nudgeSending === 'workout_reminder' ? 'Sending…' : "Let's workout"}
                </button>
              </div>
            </div>

            {nudgeError && (
              <p className="text-xs text-red-600 dark:text-red-400">{nudgeError}</p>
            )}
            {nudgeSuccess && (
              <p className="text-xs text-muted">{nudgeSuccess}</p>
            )}

            {progressLoading ? (
              <div className="rounded-2xl bg-surface px-4 py-8 text-center text-sm text-muted ring-1 ring-border">
                Loading progress…
              </div>
            ) : progressError ? (
              <div className="rounded-2xl bg-surface px-4 py-8 text-center text-sm text-red-600 ring-1 ring-border dark:text-red-400">
                {progressError}
              </div>
            ) : friendSessions.length === 0 ? (
              <div className="rounded-2xl bg-surface px-4 py-8 text-center ring-1 ring-border">
                <p className="text-sm font-medium">No workouts logged yet</p>
                <p className="mt-1 text-sm text-muted">
                  {selectedFriend.name} hasn&apos;t recorded any sessions.
                </p>
              </div>
            ) : (
              <ProgressVolumeChart weekly={weeklyProgress} monthly={monthlyProgress} />
            )}
          </section>
        ) : (
          <div className="hidden rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-16 text-center lg:block">
            <Users size={28} className="mx-auto text-muted" />
            <p className="mt-4 text-sm font-medium">Select a friend</p>
            <p className="mt-1 text-sm text-muted">
              View their training volume, wave, or send a workout reminder.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
