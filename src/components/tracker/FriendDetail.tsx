import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  ArrowLeft,
  Bell,
  BellOff,
  Calendar,
  Dumbbell,
  Flame,
  Hand,
  Heart,
  Moon,
  Trash2,
  Weight,
} from 'lucide-react'
import UserAvatar from '../UserAvatar'
import FriendRivalryChart from './FriendRivalryChart'
import FriendWeekCompare from './FriendWeekCompare'
import ProgressVolumeChart from './ProgressVolumeChart'
import { useAuth } from '../../context/AuthContext'
import { useFriends } from '../../hooks/useFriends'
import { useFriendNudges } from '../../hooks/useFriendNudges'
import { useWorkoutTracker } from '../../hooks/useWorkoutTracker'
import type { NudgeType } from '../../lib/api'
import {
  getActivityFeed,
  getCurrentWeekKeys,
  getPRHighlights,
  getTopExercises,
  getWeekComparison,
  getWorkoutDaySet,
  formatLastActive,
} from '../../lib/friendInsights'
import {
  getMonthlyProgress,
  getSessionDurationSeconds,
  getWeeklyProgress,
  sessionVolume,
} from '../../lib/workoutProgress'
import { computeStreak, toDateKey } from '../../pages/home/homeUtils'
import { TRACKER_PATHS } from '../../lib/trackerPaths'
import type { FriendUser } from '../../lib/api'
import type { WorkoutSession } from '../../types/tracker'

const NUDGE_SUCCESS: Record<NudgeType, string> = {
  wave: 'Wave sent!',
  workout_reminder: 'Workout reminder sent!',
  cheer_streak: 'Cheer sent!',
  rest_day: 'Check-in sent!',
}

function formatFriendsSince(iso?: string) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default function FriendDetail({ friendId }: { friendId: number }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const parsedFriendId = friendId
  const { sessions: mySessions } = useWorkoutTracker()
  const { friends, removeFriend, loadFriendProgress, setNotificationMute } = useFriends()
  const { sendNudge } = useFriendNudges()

  const [friend, setFriend] = useState<FriendUser | null>(
    () => friends.find((item) => item.id === parsedFriendId) ?? null,
  )
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [nudgeSending, setNudgeSending] = useState<NudgeType | null>(null)
  const [nudgeError, setNudgeError] = useState('')
  const [nudgeSuccess, setNudgeSuccess] = useState('')
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [muteToggling, setMuteToggling] = useState(false)

  const weeklyProgress = useMemo(() => getWeeklyProgress(sessions), [sessions])
  const monthlyProgress = useMemo(() => getMonthlyProgress(sessions), [sessions])
  const weekKeys = useMemo(() => getCurrentWeekKeys(), [])
  const workoutDays = useMemo(() => getWorkoutDaySet(sessions), [sessions])
  const lastActive = useMemo(() => formatLastActive(sessions), [sessions])
  const topExercises = useMemo(() => getTopExercises(sessions), [sessions])
  const prHighlights = useMemo(() => getPRHighlights(sessions), [sessions])
  const weekCompare = useMemo(
    () => getWeekComparison(mySessions, sessions),
    [mySessions, sessions],
  )
  const activityFeed = useMemo(() => getActivityFeed(sessions), [sessions])

  const myFirstName = user?.name?.split(' ')[0] ?? 'You'
  const friendFirstName = friend?.name?.split(' ')[0] ?? 'Friend'

  const stats = useMemo(() => {
    const workouts = sessions.length
    const volume = sessions.reduce((sum, session) => sum + sessionVolume(session), 0)
    const minutes = sessions.reduce(
      (sum, session) => sum + Math.floor(getSessionDurationSeconds(session) / 60),
      0,
    )
    const streak = computeStreak(sessions.map((session) => session.date))
    return { workouts, volume, minutes, streak }
  }, [sessions])

  const myStreak = useMemo(
    () => computeStreak(mySessions.map((session) => session.date)),
    [mySessions],
  )

  useEffect(() => {
    if (!Number.isInteger(parsedFriendId) || parsedFriendId <= 0) {
      navigate(TRACKER_PATHS.friends, { replace: true })
      return
    }

    const known = friends.find((item) => item.id === parsedFriendId)
    if (known) setFriend(known)

    setLoading(true)
    setError('')

    void loadFriendProgress(parsedFriendId)
      .then(({ friend: loadedFriend, sessions: loadedSessions }) => {
        setFriend(loadedFriend)
        setSessions(loadedSessions)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load friend')
      })
      .finally(() => setLoading(false))
  }, [parsedFriendId, friends, loadFriendProgress, navigate])

  async function handleSendNudge(type: NudgeType) {
    if (!friend) return

    setNudgeError('')
    setNudgeSuccess('')
    setNudgeSending(type)

    try {
      await sendNudge(friend.id, type)
      setNudgeSuccess(NUDGE_SUCCESS[type])
    } catch (err) {
      setNudgeError(err instanceof Error ? err.message : 'Failed to send')
    } finally {
      setNudgeSending(null)
    }
  }

  async function handleRemoveFriend() {
    if (!friend) return

    setRemoving(true)
    try {
      await removeFriend(friend.id)
      navigate(TRACKER_PATHS.friends)
    } finally {
      setRemoving(false)
    }
  }

  async function handleToggleMute() {
    if (!friend || muteToggling) return

    const nextMuted = !friend.notificationsMuted
    setMuteToggling(true)

    try {
      await setNotificationMute(friend.id, nextMuted)
      setFriend((current) =>
        current ? { ...current, notificationsMuted: nextMuted } : current,
      )
    } finally {
      setMuteToggling(false)
    }
  }

  function handleBack() {
    navigate(TRACKER_PATHS.friends)
  }

  const friendsSince = formatFriendsSince(friend?.friendsSince)

  function formatVolume(kg: number) {
    if (kg <= 0) return '—'
    if (kg >= 1000) return `${(kg / 1000).toFixed(1)}k`
    return String(kg)
  }

  const nudgeButtons: { type: NudgeType; label: string; icon: typeof Hand }[] = [
    { type: 'wave', label: 'Wave', icon: Hand },
    { type: 'workout_reminder', label: "Let's workout", icon: Dumbbell },
    { type: 'cheer_streak', label: 'Nice streak', icon: Heart },
    { type: 'rest_day', label: 'Rest day?', icon: Moon },
  ]

  return (
    <div className="min-h-full bg-background text-foreground lg:mx-auto lg:max-w-3xl">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-sm lg:desktop-page-header lg:static lg:px-10 lg:py-6">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back to friends"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-muted transition hover:bg-surface hover:text-foreground"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="min-w-0">
          <p className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-muted lg:block">
            Friends
          </p>
          <h1 className="truncate text-lg font-semibold lg:text-2xl lg:tracking-tight">
            {friend?.name ?? 'Friend'}
          </h1>
        </div>
      </header>

      <div className="desktop-page-body mx-auto max-w-lg space-y-6 px-5 py-6 lg:max-w-none lg:px-10 lg:pb-10">
        {loading ? (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
              <div className="flex gap-4 p-4">
                <div className="h-24 w-24 shrink-0 animate-pulse rounded-full bg-background" />
                <div className="flex-1 space-y-2 pt-2">
                  <div className="h-5 w-32 animate-pulse rounded bg-background" />
                  <div className="h-4 w-24 animate-pulse rounded bg-background" />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 px-4 pb-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-background" />
                ))}
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-surface px-4 py-10 text-center text-sm text-red-600 ring-1 ring-border dark:text-red-400">
            {error}
          </div>
        ) : friend ? (
          <>
            <section className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
              <div className="relative px-4 pb-4 pt-5">
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-br from-sky-500/10 via-transparent to-violet-500/10"
                  aria-hidden
                />
                <div className="relative flex items-start gap-4">
                  <UserAvatar
                    name={friend.name}
                    avatarUrl={friend.avatarUrl}
                    size="xl"
                    className="ring-2 ring-background shadow-md"
                  />
                  <div className="min-w-0 flex-1 pt-1">
                    <h2 className="truncate text-xl font-semibold tracking-tight">{friend.name}</h2>
                    <p className="mt-0.5 truncate text-sm text-muted">@{friend.username ?? 'unknown'}</p>
                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      {lastActive && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-1 text-[11px] font-medium text-muted ring-1 ring-border backdrop-blur-sm">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {lastActive}
                        </span>
                      )}
                      {friendsSince && (
                        <span className="text-[11px] text-muted">Friends since {friendsSince}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="relative mt-4 grid grid-cols-4 gap-2">
                  {[
                    { label: 'Workouts', value: stats.workouts, icon: Activity },
                    {
                      label: 'Volume',
                      value: formatVolume(stats.volume),
                      icon: Weight,
                    },
                    { label: 'Minutes', value: stats.minutes > 0 ? stats.minutes : '—', icon: Flame },
                    {
                      label: 'Streak',
                      value: stats.streak > 0 ? `${stats.streak}d` : '—',
                      icon: Calendar,
                    },
                  ].map(({ label, value, icon: Icon }) => (
                    <div
                      key={label}
                      className="rounded-xl bg-background/70 px-2 py-2.5 text-center ring-1 ring-border/80 backdrop-blur-sm"
                    >
                      <Icon size={13} className="mx-auto text-muted" />
                      <p className="mt-1 text-sm font-semibold tabular-nums">{value}</p>
                      <p className="mt-0.5 text-[9px] font-medium uppercase tracking-wide text-muted">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border bg-background/40 px-3 py-3">
                <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                  Nudge
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {nudgeButtons.map(({ type, label, icon: Icon }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => void handleSendNudge(type)}
                      disabled={nudgeSending !== null}
                      className={[
                        'flex flex-col items-center gap-1.5 rounded-xl px-1 py-2.5 text-center transition',
                        nudgeSending === type
                          ? 'bg-foreground/10 text-foreground'
                          : 'bg-surface text-muted hover:bg-surface-elevated/80 hover:text-foreground',
                        'disabled:opacity-50',
                      ].join(' ')}
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-background ring-1 ring-border">
                        <Icon size={16} />
                      </span>
                      <span className="text-[10px] font-medium leading-tight">
                        {nudgeSending === type ? 'Sending…' : label}
                      </span>
                    </button>
                  ))}
                </div>
                {(nudgeError || nudgeSuccess) && (
                  <p
                    className={[
                      'mt-2 rounded-lg px-3 py-2 text-center text-xs',
                      nudgeError
                        ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                        : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
                    ].join(' ')}
                  >
                    {nudgeError || nudgeSuccess}
                  </p>
                )}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                This week
              </h2>
              <div className="flex justify-between gap-1 rounded-2xl bg-surface px-4 py-4 ring-1 ring-border">
                {weekKeys.map((key) => {
                  const [, , d] = key.split('-').map(Number)
                  const active = workoutDays.has(key)
                  const isToday = key === toDateKey(new Date())
                  return (
                    <div key={key} className="flex flex-col items-center gap-2">
                      <span className="text-[10px] font-medium text-muted">
                        {new Date(`${key}T12:00:00`).toLocaleDateString('en-US', {
                          weekday: 'narrow',
                        })}
                      </span>
                      <span
                        className={[
                          'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold tabular-nums',
                          active
                            ? 'bg-foreground text-background'
                            : 'bg-background text-muted ring-1 ring-border',
                          isToday && !active ? 'text-red-500 ring-red-500/30' : '',
                        ].join(' ')}
                      >
                        {d}
                      </span>
                    </div>
                  )
                })}
              </div>
            </section>

            <FriendRivalryChart
              mySessions={mySessions}
              friendSessions={sessions}
              myLabel={myFirstName}
              friendLabel={friendFirstName}
              myStreak={myStreak}
              friendStreak={stats.streak}
            />

            <FriendWeekCompare
              myLabel={myFirstName}
              friendLabel={friendFirstName}
              data={weekCompare}
            />

            {(topExercises.length > 0 || prHighlights.length > 0) && (
              <section className="grid gap-3 sm:grid-cols-2">
                {topExercises.length > 0 && (
                  <div className="rounded-2xl bg-surface p-4 ring-1 ring-border">
                    <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                      Top exercises
                    </h2>
                    <div className="space-y-2">
                      {topExercises.map(({ name, count }) => (
                        <div key={name} className="flex items-center justify-between gap-2 text-sm">
                          <span className="truncate font-medium">{name}</span>
                          <span className="shrink-0 text-xs text-muted">{count}×</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {prHighlights.length > 0 && (
                  <div className="rounded-2xl bg-surface p-4 ring-1 ring-border">
                    <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                      PR highlights
                    </h2>
                    <div className="space-y-2">
                      {prHighlights.map((pr) => (
                        <div key={pr.exercise} className="text-sm">
                          <p className="truncate font-medium">{pr.exercise}</p>
                          <p className="text-xs text-muted">
                            {pr.weight > 0
                              ? `${pr.weight} kg × ${pr.reps}`
                              : `${pr.reps} reps`}
                            {' · '}
                            est. {pr.est1RM} kg 1RM
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {activityFeed.length > 0 && (
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  Activity
                </h2>
                <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
                  {activityFeed.map((item, index) => (
                    <div
                      key={item.id}
                      className={[
                        'flex items-start justify-between gap-3 px-4 py-3.5',
                        index > 0 ? 'border-t border-border' : '',
                      ].join(' ')}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="mt-0.5 text-xs text-muted">{item.subtitle}</p>
                      </div>
                      <span className="shrink-0 text-[11px] text-muted">{item.when}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Training volume
              </h2>
              {sessions.length === 0 ? (
                <div className="rounded-2xl bg-surface px-4 py-10 text-center ring-1 ring-border">
                  <Activity size={24} className="mx-auto text-muted" />
                  <p className="mt-3 text-sm font-medium">No workouts yet</p>
                  <p className="mt-1 text-sm text-muted">
                    Send a nudge to get {friend.name} training.
                  </p>
                </div>
              ) : (
                <ProgressVolumeChart weekly={weeklyProgress} monthly={monthlyProgress} />
              )}
            </section>

            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Manage
              </h2>
              <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
                {confirmRemove ? (
                  <div className="bg-red-50/80 p-4 dark:bg-red-950/20">
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      Remove {friend.name}?
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      They won&apos;t appear in your friends list.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmRemove(false)}
                        disabled={removing}
                        className="flex-1 rounded-xl bg-background py-2.5 text-sm font-medium ring-1 ring-border"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleRemoveFriend()}
                        disabled={removing}
                        className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {removing ? 'Removing…' : 'Remove'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background text-muted ring-1 ring-border">
                        {friend.notificationsMuted ? <BellOff size={16} /> : <Bell size={16} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">Notifications</span>
                        <span className="mt-0.5 block text-xs text-muted">
                          Push alerts from {friendFirstName}
                        </span>
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={!friend.notificationsMuted}
                        aria-label={`Notifications from ${friend.name}`}
                        disabled={muteToggling}
                        onClick={() => void handleToggleMute()}
                        className={[
                          'relative h-7 w-12 shrink-0 rounded-full transition disabled:opacity-50',
                          !friend.notificationsMuted ? 'bg-foreground' : 'bg-border',
                        ].join(' ')}
                      >
                        <span
                          className={[
                            'absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-background shadow transition',
                            !friend.notificationsMuted ? 'translate-x-5' : 'translate-x-0',
                          ].join(' ')}
                        />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfirmRemove(true)}
                      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-surface-elevated/80"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
                        <Trash2 size={16} />
                      </span>
                      <span className="text-sm font-medium text-red-600 dark:text-red-400">
                        Remove friend
                      </span>
                    </button>
                  </>
                )}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  )
}
