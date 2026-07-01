import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  Dumbbell,
  Flame,
  LogOut,
  Mail,
  Moon,
  Sun,
  Trash2,
  TrendingUp,
  User,
} from 'lucide-react'
import Button from '../components/Button'
import UserAvatar from '../components/UserAvatar'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useWorkoutTracker } from '../hooks/useWorkoutTracker'

function computeStreak(dates: string[]) {
  if (dates.length === 0) return 0
  const uniqueDays = [...new Set(dates.map((d) => d.slice(0, 10)))].sort().reverse()
  let streak = 0
  const today = new Date()
  for (let i = 0; i < uniqueDays.length; i++) {
    const expected = new Date(today)
    expected.setDate(today.getDate() - i)
    const expectedKey = expected.toISOString().slice(0, 10)
    if (uniqueDays.includes(expectedKey)) streak++
    else break
  }
  return streak
}

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout, deleteAccount } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const { sessions } = useWorkoutTracker()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const firstName = user?.name?.split(' ')[0] ?? 'Athlete'

  const stats = useMemo(() => {
    const completed = sessions.length
    const minutes = completed > 0
      ? sessions.reduce((sum, s) => sum + Math.max(s.exercises.length * 8, 15), 0)
      : 0
    const calories = completed > 0 ? Math.round(minutes * 10.8) : 0
    const streak = computeStreak(sessions.map((s) => s.date))

    return { completed, minutes, calories, streak }
  }, [sessions])

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

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-full bg-background text-foreground">
      <header className="px-5 pt-8 lg:px-10">
        <div className="flex items-center gap-2">
          <Dumbbell size={20} />
          <span className="text-xs font-bold tracking-widest text-muted">PROFILE</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold lg:text-3xl">Hey, {firstName}</h1>
        <p className="mt-1 text-sm text-muted">Manage your account & preferences</p>
      </header>

      <div className="mt-8 px-5 lg:px-10">
        <div className="relative overflow-hidden rounded-3xl bg-surface p-6 ring-1 ring-border">
          <div className="relative flex items-center gap-4">
            <UserAvatar name={user?.name} avatarUrl={user?.avatarUrl} size="lg" />
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold">{user?.name}</h2>
              <p className="mt-0.5 truncate text-sm text-muted">{user?.email}</p>
              <span className="mt-2 inline-block rounded-full bg-foreground/10 px-3 py-0.5 text-xs font-semibold">
                Member
              </span>
            </div>
          </div>
        </div>

        <section className="mt-6 grid grid-cols-2 gap-3">
          {[
            { icon: Dumbbell, value: stats.completed, label: 'Workouts' },
            { icon: Flame, value: stats.calories, label: 'Calories' },
            { icon: Calendar, value: stats.minutes, label: 'Minutes' },
            { icon: TrendingUp, value: stats.streak, label: 'Day streak' },
          ].map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="rounded-2xl bg-surface px-4 py-4 ring-1 ring-border"
            >
              <Icon size={16} className="text-foreground" />
              <p className="mt-2 text-xl font-bold">{value}</p>
              <p className="text-xs text-muted">{label}</p>
            </div>
          ))}
        </section>

        <section className="mt-8">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
            Settings
          </h3>
          <div className="space-y-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex w-full items-center justify-between rounded-2xl bg-surface px-4 py-4 ring-1 ring-border transition hover:ring-foreground/20"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-elevated">
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </div>
                <div className="text-left">
                  <p className="font-medium">Appearance</p>
                  <p className="text-xs text-muted">{isDark ? 'Dark' : 'Light'}</p>
                </div>
              </div>
              <div
                className={[
                  'relative h-7 w-12 rounded-full transition-colors',
                  isDark ? 'bg-accent' : 'bg-border',
                ].join(' ')}
              >
                <span
                  className={[
                    'absolute top-0.5 h-6 w-6 rounded-full bg-background transition-transform',
                    isDark ? 'left-5' : 'left-0.5',
                  ].join(' ')}
                />
              </div>
            </button>

            <div className="flex items-center gap-4 rounded-2xl bg-surface px-4 py-4 ring-1 ring-border">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-elevated">
                <User size={18} className="text-muted" />
              </div>
              <div>
                <p className="text-xs text-muted">Full name</p>
                <p className="font-medium">{user?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl bg-surface px-4 py-4 ring-1 ring-border">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-elevated">
                <Mail size={18} className="text-muted" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted">Email</p>
                <p className="truncate font-medium">{user?.email}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 space-y-3 pb-8">
          <Button variant="outline" fullWidth className="gap-2 py-3.5" onClick={handleLogout}>
            <LogOut size={18} />
            Log out
          </Button>

          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-3.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
            >
              <Trash2 size={18} />
              Delete account
            </button>
          ) : (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">Delete your account?</p>
              <p className="mt-1 text-sm text-red-600/80 dark:text-red-400/70">
                This permanently removes your account and cannot be undone.
              </p>
              {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 rounded-xl bg-surface-elevated py-2.5 text-sm font-semibold transition hover:opacity-80"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Yes, delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
