import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Activity,
  ChevronRight,
  Flame,
} from 'lucide-react'
import StatGrid from '../components/ui/StatGrid'
import UserAvatar from '../components/UserAvatar'
import { SettingsCard, SettingsRow, SettingsSection } from '../components/profile/SettingsUI'
import AccountSettings from '../components/profile/AccountSettings'
import DataSettings from '../components/profile/DataSettings'
import PermissionsSettings from '../components/profile/PermissionsSettings'
import SettingsHub, { ProfileSettingsEntry } from '../components/profile/SettingsHub'
import WinterArcPanel from '../components/profile/WinterArcPanel'
import { useAuth } from '../context/AuthContext'
import { clearAllUserData as apiClearAllUserData } from '../lib/api'
import { clearLocalUserData, clearUserDataCache } from '../lib/userDataSync'
import { useTheme } from '../context/ThemeContext'
import { useTour } from '../context/TourContext'
import { useCalorieTracker } from '../hooks/useCalorieTracker'
import { useWinterArc } from '../hooks/useWinterArc'
import { useWorkoutTracker } from '../hooks/useWorkoutTracker'
import { useWorkoutPlan } from '../hooks/useWorkoutPlan'
import { toLocalDateKey } from '../lib/nutritionMath'
import { sessionVolume } from '../lib/workoutProgress'
import { computeStreak, toDateKey } from './home/homeUtils'
import { computeWinterArcProgress } from '../lib/winterArc'
import { getProfileView, isProfileSubPath, PROFILE_PATHS } from '../lib/profilePaths'

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

export default function Profile() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, token, isLocal, logout, deleteAccount, changePassword, refreshUser } = useAuth()
  const { isDark, setTheme } = useTheme()
  const { replayTour } = useTour()
  const { sessions } = useWorkoutTracker()
  const { plan } = useWorkoutPlan()
  const { profile: nutritionProfile, logs, ready: nutritionReady } = useCalorieTracker()
  const { state: winterArcState, enroll, leave, setShowOnHome } = useWinterArc()
  const view = getProfileView(location.pathname)

  useEffect(() => {
    if (isProfileSubPath(location.pathname) && getProfileView(location.pathname) === 'main') {
      navigate(PROFILE_PATHS.main, { replace: true })
    }
  }, [location.pathname, navigate])

  useEffect(() => {
    if (!token) return
    void refreshUser().catch(() => {
      // Keep cached profile if refresh fails offline.
    })
  }, [token, refreshUser, view])

  const firstName = user?.name?.split(' ')[0] ?? 'Athlete'
  const todayKey = toLocalDateKey()

  const stats = useMemo(() => {
    const workouts = sessions.length
    const streak = computeStreak(sessions.map((s) => s.date))
    const todayCals =
      nutritionReady && nutritionProfile?.onboarded
        ? logs
            .filter((e) => toLocalDateKey(new Date(e.loggedAt)) === todayKey)
            .reduce((sum, e) => sum + e.calories, 0)
        : null

    return { workouts, streak, todayCals }
  }, [sessions, logs, nutritionReady, nutritionProfile, todayKey])

  const profileStatItems = useMemo(() => {
    const items = [
      { value: stats.workouts, label: 'Workouts' },
      { value: stats.streak, label: 'Streak' },
    ]
    if (nutritionProfile?.onboarded && stats.todayCals !== null) {
      items.push({ value: stats.todayCals, label: 'Calories' })
    }
    return items
  }, [stats, nutritionProfile?.onboarded])

  const winterArcProgress = useMemo(
    () => computeWinterArcProgress(sessions, winterArcState),
    [sessions, winterArcState],
  )

  const workoutDays = useMemo(() => {
    const set = new Set(sessions.map((s) => toDateKey(new Date(s.date))))
    return set
  }, [sessions])

  const weekKeys = useMemo(() => getWeekKeys(), [])
  const recentSessions = sessions.slice(0, 3)

  if (view === 'data') {
    return (
      <DataSettings
        userName={user?.name}
        sessions={sessions}
        plan={plan}
        nutritionProfile={nutritionProfile}
        foodLogs={logs}
        onBack={() => navigate(PROFILE_PATHS.settings)}
        isLocal={isLocal}
        onClearAllData={async () => {
          if (!token || !user?.id) throw new Error('Not signed in')
          clearUserDataCache()
          if (!isLocal) {
            await apiClearAllUserData(token)
          }
          clearLocalUserData(user.id)
          window.location.reload()
        }}
      />
    )
  }

  if (view === 'account') {
    return (
      <AccountSettings
        user={user}
        isLocal={isLocal}
        onBack={() => navigate(PROFILE_PATHS.settings)}
        onChangePassword={changePassword}
        onDeleteAccount={async () => {
          await deleteAccount()
          navigate('/login')
        }}
      />
    )
  }

  if (view === 'permissions') {
    return <PermissionsSettings onBack={() => navigate(PROFILE_PATHS.settings)} />
  }

  if (view === 'settings') {
    return (
      <SettingsHub
        isDark={isDark}
        setTheme={setTheme}
        onBack={() => navigate(PROFILE_PATHS.main)}
        onOpenAccount={() => navigate(PROFILE_PATHS.account)}
        onOpenData={() => navigate(PROFILE_PATHS.data)}
        onOpenPermissions={() => navigate(PROFILE_PATHS.permissions)}
        onReplayTour={replayTour}
        isLocal={isLocal}
        hasAdminAccess={user?.hasAdminAccess}
        onOpenAdmin={() => navigate('/admin')}
        onLogout={() => {
          logout()
          navigate('/login')
        }}
      />
    )
  }

  return (
    <div className="min-h-full bg-background text-foreground lg:desktop-page lg:mx-auto lg:max-w-6xl">
      <header className="px-4 pt-[calc(var(--sat)+1.25rem)] lg:hidden">
        <h1 className="text-[2rem] font-normal leading-tight tracking-tight">Profile</h1>
        <div className="mt-5 flex items-center gap-4">
          <UserAvatar name={user?.name} avatarUrl={user?.avatarUrl} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-xl font-medium">{user?.name}</p>
            <p className="truncate text-sm text-muted">
              {isLocal ? 'Saved on this device' : user?.email}
            </p>
            {stats.streak > 0 && (
              <p className="mt-1 text-sm text-muted">{stats.streak} day streak</p>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto mt-5 max-w-lg px-3 lg:hidden">
        <div className="overflow-hidden rounded-[1.5rem] bg-surface">
          <StatGrid items={profileStatItems} className="rounded-[1.5rem] !ring-0" />
        </div>
      </div>

      {/* Desktop hero */}
      <section className="relative hidden overflow-hidden text-white lg:desktop-page-header lg:flex lg:items-center lg:justify-between lg:gap-10 lg:px-10 lg:pb-12 lg:pt-12">
        <img
          src="/images/gym_background/gym-pic.jpg"
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-black/60 to-black/85" />
        <div className="relative mx-auto flex max-w-lg flex-col items-center text-center lg:mx-0 lg:max-w-none lg:flex-1 lg:flex-row lg:items-center lg:gap-8 lg:text-left">
          <UserAvatar
            name={user?.name}
            avatarUrl={user?.avatarUrl}
            size="xl"
            className="mx-auto ring-2 ring-white/20 lg:mx-0"
          />
          <div className="mt-5 lg:mt-0">
            <h1 className="text-2xl font-semibold tracking-tight">{user?.name}</h1>
            <p className="mt-1 text-sm text-white/55">
              {isLocal ? 'Saved on this device' : user?.email}
            </p>
            {stats.streak > 0 && (
              <p className="mt-4 text-xs font-medium tracking-wide text-white/70">
                {stats.streak} day streak · keep it going, {firstName}
              </p>
            )}
          </div>
        </div>

        <div className="relative z-10 mx-auto mt-8 hidden w-full max-w-md lg:block lg:max-w-sm">
          <StatGrid items={profileStatItems} variant="light" />
        </div>
      </section>

      <div className="desktop-page-body desktop-page mx-auto max-w-lg space-y-3 px-3 pb-4 pt-2 lg:grid lg:max-w-none lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8 lg:space-y-0 lg:px-10 lg:pb-10 lg:pt-10">
        <div className="space-y-3 lg:space-y-6">
        <section>
          <h2 className="px-4 pb-2 pt-3 text-sm font-medium text-foreground/80">This week</h2>
          <div className="flex justify-between gap-1 rounded-[1.5rem] bg-surface px-4 py-4">
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
          <div className="flex items-center justify-between px-4 pb-2 pt-3">
            <h2 className="text-sm font-medium text-foreground/80">Recent</h2>
            {sessions.length > 0 && (
              <button
                type="button"
                onClick={() => navigate('/tracker')}
                className="text-sm font-medium text-foreground/70"
              >
                See all
              </button>
            )}
          </div>

          {recentSessions.length === 0 ? (
            <SettingsCard>
              <SettingsRow
                icon={<Activity />}
                label="Start your first workout"
                value="Log sets and track progress"
                onClick={() => navigate('/tracker')}
                trailing={<ChevronRight size={20} className="shrink-0 text-muted" />}
              />
            </SettingsCard>
          ) : (
            <SettingsCard>
              {recentSessions.map((session) => {
                const vol = sessionVolume(session)
                return (
                  <SettingsRow
                    key={session.id}
                    icon={
                      <span className="text-sm font-medium tabular-nums">
                        {session.exercises.length}
                      </span>
                    }
                    label={session.name}
                    value={`${formatShortDate(session.date)}${vol > 0 ? ` · ${vol.toLocaleString()} kg` : ''}`}
                    onClick={() => navigate('/tracker')}
                    trailing={<ChevronRight size={20} className="shrink-0 text-muted" />}
                  />
                )
              })}
            </SettingsCard>
          )}
        </section>
        </div>

        <div className="space-y-3 lg:sticky lg:top-8 lg:space-y-6 lg:self-start">
        {nutritionReady && !nutritionProfile?.onboarded && (
          <SettingsSection title="Nutrition">
            <SettingsCard>
              <SettingsRow
                icon={<Flame />}
                label="Set up calorie tracking"
                value="Goals, macros, and daily logs"
                onClick={() => navigate('/calories')}
                trailing={<ChevronRight size={20} className="shrink-0 text-muted" />}
              />
            </SettingsCard>
          </SettingsSection>
        )}

        <WinterArcPanel
          state={winterArcState}
          progress={winterArcProgress}
          onEnroll={enroll}
          onLeave={leave}
          onShowOnHomeChange={setShowOnHome}
        />

        <ProfileSettingsEntry onClick={() => navigate(PROFILE_PATHS.settings)} />
        </div>
      </div>
    </div>
  )
}
