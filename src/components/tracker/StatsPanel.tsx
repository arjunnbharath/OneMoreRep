import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  ChevronRight,
  Dumbbell,
  Search,
  Trophy,
  X,
} from 'lucide-react'
import AllTimeStatsHero from './AllTimeStatsHero'
import ExerciseHistoryChart from './ExerciseHistoryChart'
import ProgressVolumeChart from './ProgressVolumeChart'
import TrainingTimeWidget from './TrainingTimeWidget'
import {
  getActivityFeed,
  getCurrentWeekKeys,
  getPRHighlights,
  getTopExercises,
  getWorkoutDaySet,
} from '../../lib/friendInsights'
import {
  getExerciseHistory,
  getLoggedExerciseNames,
  getMonthlyProgress,
  getWeeklyProgress,
} from '../../lib/workoutProgress'
import { toDateKey } from '../../pages/home/homeUtils'
import { TRACKER_PATHS } from '../../lib/trackerPaths'
import type { WorkoutSession } from '../../types/tracker'

interface StatsPanelProps {
  sessions: WorkoutSession[]
  activeSession: WorkoutSession | null
  onOpenWorkout: () => void
}

function formatVolume(kg: number) {
  if (kg <= 0) return '0'
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}k`
  return kg.toLocaleString()
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
      {children}
    </h2>
  )
}

export default function StatsPanel({ sessions, activeSession, onOpenWorkout }: StatsPanelProps) {
  const navigate = useNavigate()
  const [exerciseQuery, setExerciseQuery] = useState('')
  const [selectedExercise, setSelectedExercise] = useState('')

  const weeklyProgress = useMemo(() => getWeeklyProgress(sessions), [sessions])
  const monthlyProgress = useMemo(() => getMonthlyProgress(sessions), [sessions])
  const weekKeys = useMemo(() => getCurrentWeekKeys(), [])
  const workoutDays = useMemo(() => getWorkoutDaySet(sessions), [sessions])
  const topExercises = useMemo(() => getTopExercises(sessions, 5), [sessions])
  const prHighlights = useMemo(() => getPRHighlights(sessions, 5), [sessions])
  const activityFeed = useMemo(() => getActivityFeed(sessions, 5), [sessions])
  const loggedExercises = useMemo(() => getLoggedExerciseNames(sessions), [sessions])

  const stats = useMemo(() => {
    const thisWeekSessions = weeklyProgress[weeklyProgress.length - 1]?.sessions ?? 0
    const lastWeekSessions = weeklyProgress[weeklyProgress.length - 2]?.sessions ?? 0
    const thisWeekVolume = weeklyProgress[weeklyProgress.length - 1]?.volume ?? 0
    const lastWeekVolume = weeklyProgress[weeklyProgress.length - 2]?.volume ?? 0

    return {
      thisWeekSessions,
      sessionDelta: thisWeekSessions - lastWeekSessions,
      volumeDelta: thisWeekVolume - lastWeekVolume,
    }
  }, [weeklyProgress])

  const filteredExercises = useMemo(() => {
    const q = exerciseQuery.trim().toLowerCase()
    if (!q) return loggedExercises.slice(0, 8)
    return loggedExercises.filter((name) => name.toLowerCase().includes(q)).slice(0, 8)
  }, [exerciseQuery, loggedExercises])

  const chartExercise = selectedExercise || loggedExercises[0] || ''
  const exerciseHistory = useMemo(
    () => (chartExercise ? getExerciseHistory(sessions, chartExercise) : []),
    [sessions, chartExercise],
  )

  const hasData = sessions.length > 0

  if (!hasData) {
    return (
      <section className="overflow-x-hidden space-y-6 px-5 pb-8 pt-4 lg:desktop-page-body lg:px-10 lg:pt-6">
        <div className="desktop-page mx-auto max-w-lg lg:max-w-2xl">
          <div className="overflow-hidden rounded-3xl bg-surface ring-1 ring-border" data-tour="stats-overview">
            <div className="relative px-6 pb-8 pt-10 text-center">
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-br from-violet-500/15 via-transparent to-sky-500/10"
                aria-hidden
              />
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-background ring-1 ring-border">
                <BarChartPlaceholder />
              </div>
              <h2 className="relative mt-5 text-xl font-semibold tracking-tight">
                Your stats will live here
              </h2>
              <p className="relative mx-auto mt-2 max-w-xs text-sm text-muted">
                Complete your first workout to unlock volume trends, PR tracking, and exercise
                progress charts.
              </p>
              <button
                type="button"
                onClick={onOpenWorkout}
                className="relative mt-6 inline-flex items-center gap-2 rounded-2xl bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
              >
                <Dumbbell size={16} />
                Start a workout
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="overflow-x-hidden space-y-8 px-5 pb-8 pt-4 lg:desktop-page-body lg:px-10 lg:pt-6">
      <div className="desktop-page mx-auto space-y-8 lg:max-w-none">
        {activeSession && (
          <button
            type="button"
            onClick={onOpenWorkout}
            className="group flex w-full items-center gap-4 overflow-hidden rounded-2xl bg-foreground p-4 text-left text-background transition hover:opacity-95"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-background/15 ring-1 ring-background/20">
              <Dumbbell size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-background/60">
                Active session
              </span>
              <span className="mt-0.5 block truncate text-sm font-semibold">{activeSession.name}</span>
              <span className="mt-0.5 block text-xs text-background/70">
                {activeSession.exercises.length} exercise
                {activeSession.exercises.length === 1 ? '' : 's'} in progress
              </span>
            </span>
            <ChevronRight
              size={18}
              className="shrink-0 text-background/70 transition group-hover:translate-x-0.5"
            />
          </button>
        )}

        <div data-tour="stats-overview">
          <AllTimeStatsHero sessions={sessions} />
        </div>

        <div>
          <SectionHeading>This week</SectionHeading>
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
                      'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold tabular-nums transition',
                      active
                        ? 'bg-foreground text-background shadow-sm'
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
        </div>

        <div>
          <SectionHeading>Time in the gym</SectionHeading>
          <TrainingTimeWidget
            sessions={sessions}
            weekly={weeklyProgress}
            monthly={monthlyProgress}
          />
        </div>

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-8">
          <div className="min-w-0">
            <SectionHeading>Training volume</SectionHeading>
            <ProgressVolumeChart weekly={weeklyProgress} monthly={monthlyProgress} />
          </div>

          <aside className="mt-8 space-y-6 lg:mt-0 lg:sticky lg:top-8">
            <div className="rounded-2xl bg-surface p-5 ring-1 ring-border">
              <p className="text-sm font-semibold">This week at a glance</p>
              <div className="mt-4 space-y-3">
                {[
                  {
                    label: 'Sessions',
                    value: stats.thisWeekSessions,
                    sub: `${stats.sessionDelta >= 0 ? '+' : ''}${stats.sessionDelta} vs last week`,
                  },
                  {
                    label: 'Volume',
                    value: `${formatVolume(weeklyProgress[weeklyProgress.length - 1]?.volume ?? 0)} kg`,
                    sub: `${stats.volumeDelta >= 0 ? '+' : ''}${formatVolume(Math.abs(stats.volumeDelta))} kg`,
                  },
                  {
                    label: 'Minutes',
                    value: weeklyProgress[weeklyProgress.length - 1]?.minutes ?? 0,
                    sub: 'logged this week',
                  },
                ].map(({ label, value, sub }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-3 rounded-xl bg-background px-3 py-2.5"
                  >
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-muted">
                        {label}
                      </p>
                      <p className="mt-0.5 text-base font-semibold tabular-nums">{value}</p>
                    </div>
                    <p className="text-right text-[10px] text-muted">{sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {prHighlights.length > 0 && (
              <div className="rounded-2xl bg-surface p-5 ring-1 ring-border">
                <div className="flex items-center gap-2">
                  <Trophy size={14} className="text-red-500" />
                  <p className="text-sm font-semibold">Personal records</p>
                </div>
                <ul className="mt-4 space-y-3">
                  {prHighlights.slice(0, 3).map((pr) => (
                    <li key={pr.exercise}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedExercise(pr.exercise)
                          setExerciseQuery('')
                        }}
                        className="w-full text-left transition hover:opacity-80"
                      >
                        <p className="truncate text-sm font-medium">{pr.exercise}</p>
                        <p className="mt-0.5 text-xs text-muted">
                          {pr.weight > 0 ? `${pr.weight} kg × ${pr.reps}` : `${pr.reps} reps`}
                          {' · '}
                          est. {pr.est1RM} kg
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>

        {(topExercises.length > 0 || prHighlights.length > 0) && (
          <div className="grid gap-4 sm:grid-cols-2">
            {topExercises.length > 0 && (
              <div className="rounded-2xl bg-surface p-5 ring-1 ring-border">
                <SectionHeading>Most trained</SectionHeading>
                <div className="space-y-3">
                  {topExercises.map(({ name, count }) => {
                    const maxCount = topExercises[0]?.count ?? 1
                    const width = Math.round((count / maxCount) * 100)
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => {
                          setSelectedExercise(name)
                          setExerciseQuery('')
                        }}
                        className="group w-full text-left"
                      >
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className="truncate font-medium group-hover:underline">
                            {name}
                          </span>
                          <span className="shrink-0 text-xs text-muted">{count}×</span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-background">
                          <div
                            className="h-full rounded-full bg-foreground/70 transition-all"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {prHighlights.length > 0 && (
              <div className="rounded-2xl bg-surface p-5 ring-1 ring-border sm:hidden">
                <div className="flex items-center gap-2">
                  <Trophy size={14} className="text-red-500" />
                  <SectionHeading>Personal records</SectionHeading>
                </div>
                <div className="space-y-3">
                  {prHighlights.map((pr) => (
                    <button
                      key={pr.exercise}
                      type="button"
                      onClick={() => {
                        setSelectedExercise(pr.exercise)
                        setExerciseQuery('')
                      }}
                      className="w-full rounded-xl bg-background px-3 py-2.5 text-left transition hover:ring-1 hover:ring-border"
                    >
                      <p className="truncate text-sm font-medium">{pr.exercise}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        est. {pr.est1RM} kg 1RM
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {loggedExercises.length > 0 && (
          <div>
            <SectionHeading>Exercise progress</SectionHeading>
            <div className="rounded-2xl bg-surface ring-1 ring-border">
              <div className="border-b border-border p-4">
                <div className="relative">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    type="search"
                    value={exerciseQuery}
                    onChange={(e) => setExerciseQuery(e.target.value)}
                    placeholder="Search exercises…"
                    className="w-full rounded-xl bg-background py-2.5 pl-10 pr-10 text-sm outline-none ring-1 ring-border placeholder:text-muted focus:ring-foreground/30"
                  />
                  {exerciseQuery && (
                    <button
                      type="button"
                      onClick={() => setExerciseQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                      aria-label="Clear search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="scrollbar-hide mt-3 flex gap-2 overflow-x-auto pb-1">
                  {filteredExercises.map((name) => {
                    const isSelected = chartExercise === name
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setSelectedExercise(name)}
                        className={[
                          'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition',
                          isSelected
                            ? 'bg-foreground text-background'
                            : 'bg-background text-muted ring-1 ring-border hover:text-foreground',
                        ].join(' ')}
                      >
                        {name}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="p-4">
                {chartExercise ? (
                  <>
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold">{chartExercise}</p>
                        <p className="mt-0.5 text-xs text-muted">
                          Estimated 1RM over time · Epley formula
                        </p>
                      </div>
                      {exerciseHistory.length > 0 && (
                        <div className="shrink-0 rounded-xl bg-background px-3 py-2 text-right ring-1 ring-border">
                          <p className="text-[10px] font-medium uppercase tracking-wide text-muted">
                            Best
                          </p>
                          <p className="text-sm font-semibold tabular-nums">
                            {Math.max(...exerciseHistory.map((p) => p.est1RM)).toFixed(1)} kg
                          </p>
                        </div>
                      )}
                    </div>
                    <ExerciseHistoryChart points={exerciseHistory} height={240} />
                  </>
                ) : (
                  <p className="py-8 text-center text-sm text-muted">
                    Log exercises to see progress charts
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activityFeed.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <SectionHeading>Recent activity</SectionHeading>
              <button
                type="button"
                onClick={() => navigate(TRACKER_PATHS.workoutHistory)}
                className="text-xs font-medium text-muted transition hover:text-foreground"
              >
                View history
              </button>
            </div>
            <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
              {activityFeed.map((item, index) => (
                <div
                  key={item.id}
                  className={[
                    'flex items-start justify-between gap-3 px-4 py-3.5',
                    index > 0 ? 'border-t border-border' : '',
                  ].join(' ')}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
                      <Activity size={14} className="text-muted" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      <p className="mt-0.5 text-xs text-muted">{item.subtitle}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted">{item.when}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function BarChartPlaceholder() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect x="4" y="18" width="5" height="10" rx="1.5" className="fill-foreground/30" />
      <rect x="11" y="12" width="5" height="16" rx="1.5" className="fill-foreground/50" />
      <rect x="18" y="8" width="5" height="20" rx="1.5" className="fill-foreground/70" />
      <rect x="25" y="14" width="5" height="14" rx="1.5" className="fill-foreground" />
    </svg>
  )
}
