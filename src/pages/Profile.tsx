import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  ChevronRight,
  Flame,
  LogOut,
  Moon,
  Sun,
  Trash2,
} from 'lucide-react'
import UserAvatar from '../components/UserAvatar'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useCalorieTracker } from '../hooks/useCalorieTracker'
import { useWorkoutTracker } from '../hooks/useWorkoutTracker'
import { toLocalDateKey } from '../lib/nutritionMath'
import { getSessionDurationSeconds, sessionVolume } from '../lib/workoutProgress'
import { computeStreak, toDateKey } from './home/homeUtils'

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getWeekKeys() {
  const today = new Date()
  const mondayOffset = (today.getDay() + 6) % 7
  const monday = new Date(today)
  monday.setDate(today.getDate() - mondayOffset)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return toDateKey(d)
  })
}

function SettingsRow({
  icon,
  label,
  value,
  onClick,
  destructive,
}: {
  icon: ReactNode
  label: string
  value?: string
  onClick?: () => void
  destructive?: boolean
}) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={[
        'flex w-full items-center gap-3 px-4 py-3.5 text-left transition',
        onClick ? 'hover:bg-surface-elevated/80 active:bg-surface-elevated' : '',
      ].join(' ')}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-elevated text-muted">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={[
            'block text-sm font-medium',
            destructive ? 'text-red-600 dark:text-red-400' : '',
          ].join(' ')}
        >
          {label}
        </span>
        {value && <span className="block truncate text-xs text-muted">{value}</span>}
      </span>
      {onClick && !destructive && <ChevronRight size={16} className="shrink-0 text-muted" />}
    </Tag>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout, deleteAccount } = useAuth()
  const { isDark, setTheme } = useTheme()
  const { sessions } = useWorkoutTracker()
  const { profile: nutritionProfile, logs, ready: nutritionReady } = useCalorieTracker()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const firstName = user?.name?.split(' ')[0] ?? 'Athlete'
  const todayKey = toLocalDateKey()

  const stats = useMemo(() => {
    const workouts = sessions.length
    const streak = computeStreak(sessions.map((s) => s.date))
    const minutes = sessions.reduce(
      (sum, s) => sum + Math.floor(getSessionDurationSeconds(s) / 60),
      0,
    )
    const todayCals =
      nutritionReady && nutritionProfile?.onboarded
        ? logs
            .filter((e) => toLocalDateKey(new Date(e.loggedAt)) === todayKey)
            .reduce((sum, e) => sum + e.calories, 0)
        : null

    return { workouts, streak, minutes, todayCals }
  }, [sessions, logs, nutritionReady, nutritionProfile, todayKey])

  const workoutDays = useMemo(() => {
    const set = new Set(sessions.map((s) => toDateKey(new Date(s.date))))
    return set
  }, [sessions])

  const weekKeys = useMemo(() => getWeekKeys(), [])
  const recentSessions = sessions.slice(0, 3)

  async function handleDelete() {
    setError('')
    setDeleting(true)
    try {
      await deleteAccount()
      navigate('/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account')
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-full bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0a0a0a] px-5 pb-16 pt-10 text-white dark:bg-[#0c0c0e] lg:px-10 lg:pt-12">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/40 dark:from-white/5 dark:to-black/60" />
        <div className="relative mx-auto max-w-lg text-center lg:max-w-2xl">
          <UserAvatar
            name={user?.name}
            avatarUrl={user?.avatarUrl}
            size="xl"
            className="mx-auto ring-2 ring-white/20"
          />
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">{user?.name}</h1>
          <p className="mt-1 text-sm text-white/55">{user?.email}</p>
          {stats.streak > 0 && (
            <p className="mt-4 text-xs font-medium tracking-wide text-white/70">
              {stats.streak} day streak · keep it going, {firstName}
            </p>
          )}
        </div>
      </section>

      {/* Floating stats */}
      <div className="relative z-10 mx-auto -mt-10 max-w-lg px-5 lg:max-w-2xl">
        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-surface p-1 shadow-lg ring-1 ring-border">
          {[
            { value: stats.workouts, label: 'Workouts' },
            { value: stats.minutes, label: 'Minutes' },
            {
              value:
                nutritionProfile?.onboarded && stats.todayCals !== null
                  ? stats.todayCals
                  : stats.streak,
              label:
                nutritionProfile?.onboarded && stats.todayCals !== null
                  ? 'Kcal today'
                  : 'Streak',
            },
          ].map(({ value, label }) => (
            <div key={label} className="rounded-xl px-2 py-4 text-center">
              <p className="text-xl font-semibold tabular-nums">{value}</p>
              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-lg space-y-6 px-5 pb-4 pt-8 lg:max-w-2xl lg:pb-8">
        {/* This week */}
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
                    {new Date(key + 'T12:00:00').toLocaleDateString('en-US', {
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

        {/* Recent */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Recent
            </h2>
            {sessions.length > 0 && (
              <button
                type="button"
                onClick={() => navigate('/tracker')}
                className="text-xs font-medium text-muted hover:text-foreground"
              >
                See all
              </button>
            )}
          </div>

          {recentSessions.length === 0 ? (
            <button
              type="button"
              onClick={() => navigate('/tracker')}
              className="flex w-full items-center gap-3 rounded-2xl bg-surface p-4 text-left ring-1 ring-border transition hover:ring-foreground/15"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background">
                <Activity size={18} />
              </span>
              <span>
                <span className="block text-sm font-semibold">Start your first workout</span>
                <span className="mt-0.5 block text-xs text-muted">Log sets and track progress</span>
              </span>
              <ChevronRight size={16} className="ml-auto text-muted" />
            </button>
          ) : (
            <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
              {recentSessions.map((session, i) => {
                const vol = sessionVolume(session)
                return (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => navigate('/tracker')}
                    className={[
                      'flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-surface-elevated/60',
                      i > 0 ? 'border-t border-border' : '',
                    ].join(' ')}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background text-xs font-bold ring-1 ring-border">
                      {session.exercises.length}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{session.name}</span>
                      <span className="block text-xs text-muted">
                        {formatShortDate(session.date)}
                        {vol > 0 ? ` · ${vol.toLocaleString()} kg` : ''}
                      </span>
                    </span>
                    <ChevronRight size={14} className="shrink-0 text-muted" />
                  </button>
                )
              })}
            </div>
          )}
        </section>

        {/* Nutrition nudge */}
        {nutritionReady && !nutritionProfile?.onboarded && (
          <button
            type="button"
            onClick={() => navigate('/calories')}
            className="flex w-full items-center gap-3 rounded-2xl bg-surface p-4 text-left ring-1 ring-border transition hover:ring-foreground/15"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-background ring-1 ring-border">
              <Flame size={18} />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold">Set up calorie tracking</span>
              <span className="mt-0.5 block text-xs text-muted">Goals, macros, and daily logs</span>
            </span>
            <ChevronRight size={16} className="text-muted" />
          </button>
        )}

        {/* Settings */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Settings
          </h2>
          <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
            <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-background">
                  {isDark ? <Moon size={16} /> : <Sun size={16} />}
                </span>
                <span className="text-sm font-medium">Appearance</span>
              </div>
              <div className="flex rounded-xl bg-background p-0.5 ring-1 ring-border">
                {(['light', 'dark'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setTheme(mode)}
                    className={[
                      'rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition',
                      (mode === 'dark') === isDark
                        ? 'bg-foreground text-background'
                        : 'text-muted',
                    ].join(' ')}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-b border-border">
              <SettingsRow icon={<LogOut size={16} />} label="Log out" onClick={() => {
                logout()
                navigate('/login')
              }} />
            </div>

            {!showDeleteConfirm ? (
              <SettingsRow
                icon={<Trash2 size={16} />}
                label="Delete account"
                destructive
                onClick={() => setShowDeleteConfirm(true)}
              />
            ) : (
              <div className="border-t border-border bg-red-50/80 p-4 dark:bg-red-950/20">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  Permanently delete your account?
                </p>
                <p className="mt-1 text-xs text-muted">
                  All workouts, calories, and progress will be erased.
                </p>
                {error && (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
                )}
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    className="flex-1 rounded-xl bg-background py-2.5 text-sm font-medium ring-1 ring-border"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {deleting ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
