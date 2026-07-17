import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Trash2, UserPlus, Users } from 'lucide-react'
import Button from '../Button'
import Input from '../Input'
import UserAvatar from '../UserAvatar'
import ProgressVolumeChart from './ProgressVolumeChart'
import { useFriends } from '../../hooks/useFriends'
import { getMonthlyProgress, getWeeklyProgress } from '../../lib/workoutProgress'
import type { FriendUser } from '../../lib/api'
import type { WorkoutSession } from '../../types/tracker'

export default function FriendsPanel() {
  const { friends, loading, error, addFriend, removeFriend, loadFriendProgress } = useFriends()
  const [username, setUsername] = useState('')
  const [addError, setAddError] = useState('')
  const [adding, setAdding] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState<FriendUser | null>(null)
  const [friendSessions, setFriendSessions] = useState<WorkoutSession[]>([])
  const [progressLoading, setProgressLoading] = useState(false)
  const [progressError, setProgressError] = useState('')
  const [removingId, setRemovingId] = useState<number | null>(null)

  const weeklyProgress = useMemo(() => getWeeklyProgress(friendSessions), [friendSessions])
  const monthlyProgress = useMemo(() => getMonthlyProgress(friendSessions), [friendSessions])

  async function handleAddFriend(e: FormEvent) {
    e.preventDefault()
    setAddError('')
    setAdding(true)

    try {
      const friend = await addFriend(username)
      setUsername('')
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
      if (selectedFriend?.id === friendId) {
        setSelectedFriend(null)
        setFriendSessions([])
      }
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 lg:max-w-2xl">
      <section className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
        <div className="border-b border-border px-4 py-4">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-muted" />
            <h2 className="text-base font-semibold">Friends</h2>
          </div>
          <p className="mt-1 text-sm text-muted">
            Add training partners by their user ID to see their workout progress.
          </p>
        </div>

        <form onSubmit={handleAddFriend} className="space-y-3 px-4 py-4">
          <Input
            label="Friend's user ID"
            type="text"
            placeholder="e.g. arjun_lifts"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            maxLength={20}
            pattern="[A-Za-z0-9_]{3,20}"
          />
          {addError && <p className="text-sm text-red-600 dark:text-red-400">{addError}</p>}
          <Button type="submit" fullWidth disabled={adding}>
            <span className="inline-flex items-center justify-center gap-2">
              <UserPlus size={16} />
              {adding ? 'Adding…' : 'Add friend'}
            </span>
          </Button>
        </form>
      </section>

      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          Your friends
        </h3>

        {loading ? (
          <div className="rounded-2xl bg-surface px-4 py-8 text-center text-sm text-muted ring-1 ring-border">
            Loading friends…
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-surface px-4 py-8 text-center text-sm text-red-600 ring-1 ring-border dark:text-red-400">
            {error}
          </div>
        ) : friends.length === 0 ? (
          <div className="rounded-2xl bg-surface px-4 py-8 text-center ring-1 ring-border">
            <Users size={24} className="mx-auto text-muted" />
            <p className="mt-3 text-sm font-medium">No friends yet</p>
            <p className="mt-1 text-sm text-muted">Add someone using their user ID above.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
            {friends.map((friend, index) => {
              const selected = selectedFriend?.id === friend.id
              return (
                <div
                  key={friend.id}
                  className={index > 0 ? 'border-t border-border' : ''}
                >
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <button
                      type="button"
                      onClick={() => void handleSelectFriend(friend)}
                      className={[
                        'flex min-w-0 flex-1 items-center gap-3 text-left transition',
                        selected ? 'opacity-100' : 'hover:opacity-80',
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
                    <button
                      type="button"
                      onClick={() => void handleRemoveFriend(friend.id)}
                      disabled={removingId === friend.id}
                      aria-label={`Remove ${friend.name}`}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted transition hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50 dark:hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {selectedFriend && (
        <section className="space-y-4">
          <div>
            <h3 className="text-base font-semibold">{selectedFriend.name}&apos;s progress</h3>
            <p className="text-sm text-muted">@{selectedFriend.username ?? 'unknown'}</p>
          </div>

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
      )}
    </div>
  )
}
