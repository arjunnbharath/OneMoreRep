import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Calendar,
  Clock,
  Copy,
  Dumbbell,
  Flame,
  Plus,
  Trash2,
  Trophy,
  Users,
  Weight,
  X,
} from 'lucide-react'
import Button from '../components/Button'
import WorkoutCalendar from '../components/WorkoutCalendar'
import ExerciseHistoryChart from '../components/tracker/ExerciseHistoryChart'
import StatsPanel from '../components/tracker/StatsPanel'
import FriendsPanel from '../components/tracker/FriendsPanel'
import AddExerciseForm from '../components/tracker/AddExerciseForm'
import ExerciseSetTable from '../components/tracker/ExerciseSetTable'
import NextMuscleReady from '../components/tracker/NextMuscleReady'
import ReadyToTrainPanel from '../components/tracker/ReadyToTrainPanel'
import WorkoutHistoryWidget from '../components/tracker/WorkoutHistoryWidget'
import ExerciseLibraryWidget from '../components/tracker/ExerciseLibraryWidget'
import ExerciseLibraryPanel from '../components/exercise-library/ExerciseLibraryPanel'
import WeeklyPlanPanel from '../components/tracker/WeeklyPlanPanel'
import PlanOnboarding from '../components/tracker/PlanOnboarding'
import { exerciseGuides, type ExerciseGroup } from '../data/exerciseGuides'
import { heroImage } from '../data/mockData'
import { useWorkoutPlan } from '../hooks/useWorkoutPlan'
import { useWorkoutPreferences } from '../hooks/useWorkoutPreferences'
import { useWorkoutTracker } from '../hooks/useWorkoutTracker'
import { useAppInstalled } from '../hooks/useAppInstalled'
import {
  exercisesForMuscle,
  getTodayWeekday,
  groupLabel,
  muscleQueueForDay,
  daysWithPlan,
  WEEKDAY_LABELS,
} from '../lib/workoutPlan'
import {
  detectSessionPRs,
  findLastExerciseLog,
  formatLastPerformance,
  getExerciseHistory,
  getLoggedExerciseNames,
  getSessionDurationSeconds,
  sessionVolume,
} from '../lib/workoutProgress'
import type { TrackedExercise, WorkoutSession } from '../types/tracker'
import type { Weekday } from '../types/workoutPlan'
import {
  getTrackerView,
  parseTrackerRoute,
  TRACKER_PATHS,
  trackerViewPath,
  type TrackerView,
} from '../lib/trackerPaths'
import { useTour } from '../context/TourContext'

type DayWorkoutFlow = {
  day: Weekday
  queue: ExerciseGroup[]
  remaining: ExerciseGroup[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatElapsed(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function getElapsedSeconds(session: WorkoutSession) {
  if (session.completedAt) return getSessionDurationSeconds(session)
  const start = new Date(session.startedAt ?? session.date).getTime()
  return Math.max(0, Math.floor((Date.now() - start) / 1000))
}

function getSessionStats(session: WorkoutSession, live = false) {
  const allSets = session.exercises.flatMap((ex) => ex.sets)
  const completedSets = allSets.filter((s) => s.completed)
  const totalSets = allSets.length
  const progress = totalSets > 0 ? Math.round((completedSets.length / totalSets) * 100) : 0
  const volume = sessionVolume(session)
  const elapsed = live ? getElapsedSeconds(session) : getSessionDurationSeconds(session)
  const minutes = Math.max(1, Math.floor(elapsed / 60))
  const calories = Math.round(minutes * 7.1)

  return { progress, volume, elapsed, calories, completedSets: completedSets.length, totalSets }
}

function toDateKey(iso: string) {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function Tracker() {
  const location = useLocation()
  const navigate = useNavigate()
  const route = parseTrackerRoute(location.pathname)
  const view = getTrackerView(route) ?? 'plan'
  const showWorkoutHistory = route.kind === 'workout' && route.history
  const showExerciseLibrary = route.kind === 'workout' && route.library === true
  const planDay = route.kind === 'plan' ? route.day : undefined
  const planMuscle = route.kind === 'plan' ? route.muscle : undefined
  const isPlanMuscleView = view === 'plan' && Boolean(planMuscle)
  const appInstalled = useAppInstalled()

  const {
    sessions,
    activeSession,
    startSession,
    startSessionWithExercises,
    addExercise,
    removeExercise,
    addSetToExercise,
    updateSet,
    toggleSetComplete,
    removeSet,
    finishSession,
    duplicateSession,
    deleteSession,
    cancelSession,
    updateSessionName,
    updateSessionNote,
  } = useWorkoutTracker()

  const {
    plan,
    ready: planReady,
    addMuscleToDay,
    removeMuscleFromDay,
    addExercise: addPlanExercise,
    removeExercise: removePlanExercise,
    replacePlan,
  } = useWorkoutPlan()

  const { preferences, ready: prefsReady, savePreferences, skipOnboarding } =
    useWorkoutPreferences()

  const { isOpen: tourOpen } = useTour()

  const needsPlanOnboarding =
    planReady &&
    prefsReady &&
    daysWithPlan(plan).length === 0 &&
    !preferences.onboarded &&
    !tourOpen

  useEffect(() => {
    if (!needsPlanOnboarding || tourOpen) return
    if (planDay || planMuscle) {
      navigate(TRACKER_PATHS.plan, { replace: true })
    }
  }, [needsPlanOnboarding, planDay, planMuscle, navigate, tourOpen])

  const [planSwipeHintKey, setPlanSwipeHintKey] = useState(0)
  const [dayWorkoutFlow, setDayWorkoutFlow] = useState<DayWorkoutFlow | null>(null)
  const [readyForNextMuscle, setReadyForNextMuscle] = useState<{
    day: Weekday
    muscle: ExerciseGroup
    lastSession: WorkoutSession
  } | null>(null)
  const [tick, setTick] = useState(0)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showFinishSummary, setShowFinishSummary] = useState<WorkoutSession | null>(null)
  const [restSeconds, setRestSeconds] = useState<number | null>(null)
  const [selectedHistoryDay, setSelectedHistoryDay] = useState<string | null>(null)
  const [selectedExercise, setSelectedExercise] = useState('')
  const [exerciseQuery, setExerciseQuery] = useState('')

  const [exerciseName, setExerciseName] = useState('')
  const [sets, setSets] = useState('3')
  const [reps, setReps] = useState('12')
  const [weight, setWeight] = useState('')

  useEffect(() => {
    if (!showWorkoutHistory) {
      setSelectedHistoryDay(null)
    }
  }, [showWorkoutHistory])

  useEffect(() => {
    if (view === 'plan' && !planDay && !planMuscle) {
      setPlanSwipeHintKey((key) => key + 1)
    }
  }, [view, planDay, planMuscle])

  function goToView(next: TrackerView) {
    navigate(trackerViewPath(next))
  }

  useEffect(() => {
    if (!activeSession || activeSession.completedAt) return
    const id = window.setInterval(() => setTick((t) => t + 1), 1000)
    return () => window.clearInterval(id)
  }, [activeSession])

  useEffect(() => {
    if (activeSession && activeSession.exercises.length === 0) {
      setShowAddForm(true)
    }
  }, [activeSession?.id, activeSession?.exercises.length])

  const isRestTimerRunning = restSeconds !== null && restSeconds > 0

  useEffect(() => {
    if (!isRestTimerRunning) return

    const id = window.setInterval(() => {
      setRestSeconds((current) => {
        if (current === null || current <= 1) return null
        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(id)
  }, [isRestTimerRunning])

  const stats = useMemo(
    () => (activeSession ? getSessionStats(activeSession, true) : null),
    [activeSession, tick],
  )

  const loggedExercises = useMemo(() => getLoggedExerciseNames(sessions), [sessions])

  const exerciseSuggestions = useMemo(() => {
    const q = exerciseQuery.trim().toLowerCase()
    if (!q) return exerciseGuides.slice(0, 8)
    return exerciseGuides.filter((e) => e.name.toLowerCase().includes(q)).slice(0, 8)
  }, [exerciseQuery])

  const sessionsOnSelectedDay = useMemo(() => {
    if (!selectedHistoryDay) return []
    return sessions.filter((s) => toDateKey(s.date) === selectedHistoryDay)
  }, [sessions, selectedHistoryDay])

  function handleToggleSetComplete(exerciseId: string, setId: string, wasCompleted: boolean) {
    toggleSetComplete(exerciseId, setId)
    if (wasCompleted) {
      setRestSeconds(null)
    } else {
      setRestSeconds(90)
    }
  }

  function resetExerciseForm() {
    setExerciseName('')
    setSets('3')
    setReps('12')
    setWeight('')
    setExerciseQuery('')
  }

  function handleCancelSession() {
    if (!activeSession) return

    const hasProgress = activeSession.exercises.some((exercise) =>
      exercise.sets.some((set) => set.completed),
    )
    if (
      hasProgress &&
      !window.confirm('Cancel this workout? Your progress will not be saved.')
    ) {
      return
    }

    cancelSession()
    setDayWorkoutFlow(null)
    setReadyForNextMuscle(null)
    setSelectedExercise('')
    setShowAddForm(false)
    resetExerciseForm()
  }

  function quickAddExercise(name: string) {
    const last = findLastExerciseLog(sessions, name)
    const lastSet = last?.sets.find((s) => s.completed) ?? last?.sets[0]
    const setCount = last?.sets.length ?? 3
    const repCount = lastSet?.reps ?? 12
    const weightVal = lastSet?.weight

    addExercise(name, setCount, repCount, weightVal)
    resetExerciseForm()
    setShowAddForm(false)
    setSelectedExercise(name)
  }

  function startMuscleSession(day: Weekday, group: ExerciseGroup) {
    const items = exercisesForMuscle(plan[day], group).map((item) => {
      const last = findLastExerciseLog(sessions, item.name)
      const lastSet = last?.sets.find((s) => s.completed) ?? last?.sets[0]
      return {
        name: item.name,
        sets: item.sets,
        reps: item.reps,
        weight: item.weight ?? lastSet?.weight,
      }
    })
    startSessionWithExercises(`${WEEKDAY_LABELS[day]} · ${groupLabel(group)}`, items)
    navigate(TRACKER_PATHS.workout)
  }

  function handleStartDayPlan(day: Weekday) {
    const queue = muscleQueueForDay(plan[day])
    if (queue.length === 0) return
    const [first, ...remaining] = queue
    setDayWorkoutFlow({ day, queue, remaining })
    setReadyForNextMuscle(null)
    startMuscleSession(day, first)
  }

  const handleStartDayPlanRef = useRef(handleStartDayPlan)
  handleStartDayPlanRef.current = handleStartDayPlan

  useEffect(() => {
    const state = location.state as { startDay?: Weekday } | null
    if (!state?.startDay) return

    handleStartDayPlanRef.current(state.startDay)

    window.history.replaceState(
      null,
      '',
      `${location.pathname}${location.search}${location.hash}`,
    )
  }, [location.pathname, location.search, location.hash, location.state])

  function handleContinueNextMuscle() {
    if (!readyForNextMuscle || !dayWorkoutFlow) return
    const { day, muscle } = readyForNextMuscle
    setReadyForNextMuscle(null)
    startMuscleSession(day, muscle)
  }

  function handleEndDayWorkout() {
    if (readyForNextMuscle) {
      setShowFinishSummary(readyForNextMuscle.lastSession)
    }
    setReadyForNextMuscle(null)
    setDayWorkoutFlow(null)
  }

  function handleAddExercise(e: FormEvent) {
    e.preventDefault()
    const setCount = parseInt(sets, 10)
    const repCount = parseInt(reps, 10)
    const weightVal = weight ? parseFloat(weight) : undefined

    if (!exerciseName.trim() || setCount < 1 || repCount < 1) return

    addExercise(exerciseName, setCount, repCount, weightVal)
    resetExerciseForm()
    setShowAddForm(false)
    setSelectedExercise(exerciseName.trim())
  }

  function handleFinish() {
    const completed = finishSession()
    if (!completed) return

    if (dayWorkoutFlow && dayWorkoutFlow.remaining.length > 0) {
      const [next, ...rest] = dayWorkoutFlow.remaining
      setDayWorkoutFlow({ ...dayWorkoutFlow, remaining: rest })
      setReadyForNextMuscle({
        day: dayWorkoutFlow.day,
        muscle: next,
        lastSession: completed,
      })
      return
    }

    setDayWorkoutFlow(null)
    setShowFinishSummary(completed)
  }

  function renderExerciseCard(exercise: TrackedExercise) {
    const lastLog = findLastExerciseLog(sessions, exercise.name)
    const lastPerf = lastLog ? formatLastPerformance(lastLog) : null

    return (
      <li
        key={exercise.id}
        className="rounded-2xl bg-surface p-4 ring-1 ring-border"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => {
                setSelectedExercise(exercise.name)
                goToView('progress')
              }}
              className="text-left text-base font-semibold leading-snug hover:underline"
            >
              {exercise.name}
            </button>
            {lastPerf && (
              <p className="mt-1 text-xs text-muted">Last · {lastPerf}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => removeExercise(exercise.id)}
            className="shrink-0 rounded-lg px-2 py-1 text-xs text-muted transition hover:bg-red-500/10 hover:text-red-500"
            aria-label={`Remove ${exercise.name}`}
          >
            Remove
          </button>
        </div>

        <ExerciseSetTable
          exercise={exercise}
          lastLog={lastLog}
          onUpdateSet={(setId, reps, weight) => updateSet(exercise.id, setId, reps, weight)}
          onToggleComplete={(setId, completed) =>
            handleToggleSetComplete(exercise.id, setId, completed)
          }
          onRemoveSet={(setId) => removeSet(exercise.id, setId)}
          onAddSet={() => {
            const last = exercise.sets[exercise.sets.length - 1]
            addSetToExercise(exercise.id, last?.reps ?? 12, last?.weight)
          }}
        />
      </li>
    )
  }

  return (
    <div
      className={[
        'flex min-h-0 flex-1 flex-col overflow-hidden bg-background text-foreground lg:mx-auto lg:max-w-7xl lg:min-h-full lg:overflow-visible',
      ].join(' ')}
    >
      <div className="shrink-0 bg-background/95 backdrop-blur-xl lg:sticky lg:top-0 lg:z-40">
      <header className="hidden border-b border-border lg:block lg:px-10 lg:py-6">
        <div className="flex items-center justify-between gap-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
              Training
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">Progress</h1>
          </div>

          <nav
            data-tour="tracker-nav"
            data-tour-nav="desktop"
            className="flex gap-1 rounded-2xl bg-surface p-1 shadow-sm ring-1 ring-border"
          >
            {(
              [
                { id: 'plan' as const, label: 'Plans', icon: Calendar, tourId: 'tracker-tab-plans' },
                { id: 'workout' as const, label: 'Workout', icon: Dumbbell, tourId: 'tracker-tab-workout' },
                { id: 'progress' as const, label: 'Stats', icon: BarChart3, tourId: 'tracker-tab-stats' },
                { id: 'friends' as const, label: 'Friends', icon: Users, tourId: 'tracker-tab-friends' },
              ] as const
            ).map(({ id, label, icon: Icon, tourId }) => (
              <button
                key={id}
                type="button"
                data-tour={tourId}
                onClick={() => goToView(id)}
                className={[
                  'flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition',
                  view === id
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted hover:text-foreground',
                ].join(' ')}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <div className="px-5 pb-3 pt-[max(1.5rem,env(safe-area-inset-top))] lg:hidden">
      <nav
        data-tour="tracker-nav"
        data-tour-nav="mobile"
        className="flex gap-1 rounded-2xl bg-surface p-1 shadow-sm ring-1 ring-border"
      >
        {(
          [
            { id: 'plan' as const, label: 'Plans', icon: Calendar, tourId: 'tracker-tab-plans' },
            { id: 'workout' as const, label: 'Workout', icon: Dumbbell, tourId: 'tracker-tab-workout' },
            { id: 'progress' as const, label: 'Stats', icon: BarChart3, tourId: 'tracker-tab-stats' },
            { id: 'friends' as const, label: 'Friends', icon: Users, tourId: 'tracker-tab-friends' },
          ] as const
        ).map(({ id, label, icon: Icon, tourId }) => (
          <button
            key={id}
            type="button"
            data-tour={tourId}
            onClick={() => goToView(id)}
            className={[
              'flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-medium transition',
              view === id
                ? 'bg-foreground text-background shadow-sm'
                : 'text-muted hover:text-foreground',
            ].join(' ')}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </nav>
      </div>
      </div>

      <div
        className={[
          'min-h-0 flex-1',
          showExerciseLibrary || isPlanMuscleView
            ? 'flex flex-col overflow-hidden'
            : 'overflow-y-auto overscroll-contain pb-[calc(var(--mobile-nav-height)+0.5rem)] lg:overflow-visible lg:pb-0',
          view === 'progress' ? 'overflow-x-hidden' : '',
        ].join(' ')}
      >

      {isRestTimerRunning && (
        <div className="mx-5 mb-4 flex items-center justify-between rounded-2xl bg-foreground/5 px-4 py-3 ring-1 ring-border lg:mx-10">
          <span className="text-sm font-medium">Rest timer</span>
          <span className="text-lg font-bold tabular-nums">{formatElapsed(restSeconds ?? 0)}</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setRestSeconds(90)}
              className="text-xs font-medium text-muted hover:text-foreground"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setRestSeconds(null)}
              className="text-xs font-medium text-muted hover:text-foreground"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {showFinishSummary && (
        <div className="pb-modal-mobile fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-3xl bg-surface p-6 ring-1 ring-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                  Workout complete
                </p>
                <h2 className="mt-1 text-xl font-bold">{showFinishSummary.name}</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowFinishSummary(null)}
                className="text-muted hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            {(() => {
              const summary = getSessionStats(showFinishSummary)
              const prs = detectSessionPRs(showFinishSummary, sessions.slice(1))
              return (
                <>
                  <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl bg-background p-3 ring-1 ring-border">
                      <Clock size={16} className="mx-auto text-muted" />
                      <p className="mt-1 text-lg font-bold tabular-nums">
                        {formatElapsed(summary.elapsed)}
                      </p>
                      <p className="text-[10px] text-muted">Duration</p>
                    </div>
                    <div className="rounded-xl bg-background p-3 ring-1 ring-border">
                      <Weight size={16} className="mx-auto text-muted" />
                      <p className="mt-1 text-lg font-bold">
                        {summary.volume.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted">Volume (kg)</p>
                    </div>
                    <div className="rounded-xl bg-background p-3 ring-1 ring-border">
                      <Flame size={16} className="mx-auto text-muted" />
                      <p className="mt-1 text-lg font-bold">{summary.calories}</p>
                      <p className="text-[10px] text-muted">Est. kcal</p>
                    </div>
                  </div>

                  {prs.length > 0 && (
                    <div className="mt-4 rounded-xl bg-red-500/10 p-4 ring-1 ring-red-500/20">
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-red-600 dark:text-red-400">
                        <Trophy size={16} />
                        New PRs
                      </p>
                      <ul className="mt-2 space-y-1">
                        {prs.map((name) => (
                          <li key={name} className="text-sm">
                            {name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    fullWidth
                    className="mt-5 py-3"
                    onClick={() => setShowFinishSummary(null)}
                  >
                    Done
                  </Button>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {view === 'workout' && !activeSession && !readyForNextMuscle && (
        showExerciseLibrary ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <ExerciseLibraryPanel
              embedded
              onBack={appInstalled ? undefined : () => navigate(TRACKER_PATHS.workout)}
            />
          </div>
        ) : showWorkoutHistory ? (
          <section className="px-5 pb-8 pt-4 lg:px-10">
            <div className="mx-auto max-w-lg lg:max-w-4xl">
              {!appInstalled && (
                <button
                  type="button"
                  onClick={() => navigate(TRACKER_PATHS.workout)}
                  className="mb-4 text-sm font-medium text-muted transition hover:text-foreground"
                >
                  ← Back to workout
                </button>
              )}

              <div className="lg:grid lg:grid-cols-2 lg:gap-6">
                <div>
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
                    <Calendar size={18} />
                    Calendar
                  </h2>
                  <WorkoutCalendar
                    sessions={sessions}
                    onDaySelect={(key) => setSelectedHistoryDay(key)}
                  />
                </div>

                <div className="mt-6 lg:mt-0">
                  <h2 className="mb-4 text-lg font-bold">
                    {selectedHistoryDay
                      ? new Date(selectedHistoryDay + 'T12:00:00').toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'All workouts'}
                  </h2>

                  {(selectedHistoryDay ? sessionsOnSelectedDay : sessions).length === 0 ? (
                    <div className="rounded-2xl bg-surface px-6 py-12 text-center ring-1 ring-border">
                      <Dumbbell className="mx-auto mb-3 text-muted" size={32} />
                      <p className="font-medium">No workouts logged</p>
                      <p className="mt-1 text-sm text-muted">Finish a session to see it here.</p>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {(selectedHistoryDay ? sessionsOnSelectedDay : sessions).map((session) => {
                        const pastStats = getSessionStats(session)
                        return (
                          <li
                            key={session.id}
                            className="rounded-2xl bg-surface p-4 ring-1 ring-border"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold">{session.name}</p>
                                <p className="mt-0.5 text-sm text-muted">{formatDate(session.date)}</p>
                                <p className="mt-2 text-xs text-muted">
                                  {session.exercises.length} exercises · {pastStats.totalSets} sets ·{' '}
                                  {pastStats.volume.toLocaleString()} kg volume ·{' '}
                                  {formatElapsed(pastStats.elapsed)}
                                </p>
                                {session.note && (
                                  <p className="mt-2 text-xs italic text-muted">{session.note}</p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    duplicateSession(session.id)
                                    navigate(TRACKER_PATHS.workout)
                                  }}
                                  className="text-muted transition hover:text-foreground"
                                  aria-label="Duplicate workout"
                                >
                                  <Copy size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteSession(session.id)}
                                  aria-label="Delete workout"
                                  className="text-muted transition hover:text-red-500"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="space-y-5 px-5 pb-8 pt-4 lg:desktop-page-body lg:px-10">
            <div className="desktop-page mx-auto max-w-lg lg:max-w-3xl">
              <ReadyToTrainPanel
                plan={plan}
                lastSession={sessions[0] ?? null}
                onStartToday={() => handleStartDayPlan(getTodayWeekday())}
                onStartEmpty={() => startSession("Today's Workout")}
                onEditPlan={() => goToView('plan')}
                onRepeatLast={
                  sessions[0]
                    ? () => duplicateSession(sessions[0].id)
                    : undefined
                }
                formatSessionDate={formatDate}
              />
            </div>

            <div className="desktop-page mx-auto max-w-lg space-y-4 lg:max-w-3xl">
              <ExerciseLibraryWidget
                onOpen={() => navigate(TRACKER_PATHS.exerciseLibrary)}
              />
              <WorkoutHistoryWidget
                sessions={sessions}
                formatDate={formatDate}
                onOpen={() => navigate(TRACKER_PATHS.workoutHistory)}
              />
            </div>
          </section>
        )
      )}

      {view === 'progress' && (
        <StatsPanel
          sessions={sessions}
          activeSession={activeSession}
          onOpenWorkout={() => goToView('workout')}
        />
      )}

      {view === 'plan' && (
        <section
          className={[
            'px-5 lg:desktop-page-body lg:px-10',
            isPlanMuscleView
              ? 'flex min-h-0 flex-1 flex-col pb-0'
              : 'overflow-x-clip pb-8',
          ].join(' ')}
        >
          <div
            className={[
              'desktop-page lg:max-w-5xl',
              isPlanMuscleView ? 'flex min-h-0 flex-1 flex-col' : '',
            ].join(' ')}
          >
            {needsPlanOnboarding ? (
              <PlanOnboarding
                onComplete={(generatedPlan, answers, splitType) => {
                  replacePlan(generatedPlan)
                  savePreferences({
                    onboarded: true,
                    daysPerWeek: answers.daysPerWeek,
                    experience: answers.experience,
                    goal: answers.goal,
                    splitType,
                  })
                }}
                onSkip={skipOnboarding}
              />
            ) : (
              <WeeklyPlanPanel
                plan={plan}
                planDay={planDay}
                planMuscle={planMuscle}
                onNavigateWeek={() => navigate(TRACKER_PATHS.plan)}
                onNavigateDay={(day) => navigate(TRACKER_PATHS.planDay(day))}
                onNavigateMuscle={(day, group) => navigate(TRACKER_PATHS.planMuscle(day, group))}
                onAddMuscle={addMuscleToDay}
                onRemoveMuscle={removeMuscleFromDay}
                onAddExercise={addPlanExercise}
                onRemoveExercise={removePlanExercise}
                onStartDay={handleStartDayPlan}
                swipeHintKey={planSwipeHintKey}
              />
            )}
          </div>
        </section>
      )}

      {view === 'friends' && (
        <section className="px-5 pb-8 lg:desktop-page-body lg:px-10">
          <FriendsPanel />
        </section>
      )}

      {view === 'workout' && !activeSession && readyForNextMuscle && (
        <div className="pt-4">
        <NextMuscleReady
          day={readyForNextMuscle.day}
          muscle={readyForNextMuscle.muscle}
          plan={plan}
          lastSession={readyForNextMuscle.lastSession}
          onContinue={handleContinueNextMuscle}
          onDone={handleEndDayWorkout}
        />
        </div>
      )}

      {view === 'workout' && activeSession && (
        <div className="pt-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:px-10">
          <div>
            <section className="relative mx-5 overflow-hidden rounded-3xl lg:mx-0">
              <img src={heroImage} alt="" className="h-44 w-full object-cover lg:h-52" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
              <button
                type="button"
                onClick={handleCancelSession}
                className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-xl bg-black/35 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/15 backdrop-blur-sm transition hover:bg-black/50"
              >
                <X size={14} />
                Cancel
              </button>
              <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">
                  Active workout
                </p>
                <input
                  type="text"
                  value={activeSession.name}
                  onChange={(e) => updateSessionName(e.target.value)}
                  className="mt-1 w-full bg-transparent text-2xl font-bold outline-none"
                  placeholder="Workout name"
                />
                <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-[10px] text-white/60">Time</p>
                    <p className="text-base font-bold tabular-nums">
                      {stats ? formatElapsed(stats.elapsed) : '0:00'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/60">Volume</p>
                    <p className="text-base font-bold">
                      {stats?.volume.toLocaleString() ?? 0} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/60">Sets</p>
                    <p className="text-base font-bold">
                      {stats?.completedSets ?? 0}/{stats?.totalSets ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-6 px-5 lg:px-0">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Exercises</h2>
                {activeSession.exercises.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAddForm((v) => !v)}
                    className={[
                      'flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium ring-1 ring-border transition',
                      showAddForm
                        ? 'bg-foreground text-background'
                        : 'bg-surface text-muted hover:text-foreground',
                    ].join(' ')}
                    aria-label="Add exercise"
                  >
                    <Plus size={14} />
                    Add
                  </button>
                )}
              </div>

              {activeSession.exercises.length === 0 ? (
                <div className="mt-4">
                  <AddExerciseForm
                    variant="prominent"
                    exerciseName={exerciseName}
                    exerciseQuery={exerciseQuery}
                    sets={sets}
                    reps={reps}
                    weight={weight}
                    suggestions={exerciseSuggestions}
                    recentExercises={loggedExercises}
                    onQueryChange={(v) => {
                      setExerciseQuery(v)
                      setExerciseName(v)
                    }}
                    onSetsChange={setSets}
                    onRepsChange={setReps}
                    onWeightChange={setWeight}
                    onSelectExercise={(name) => {
                      setExerciseName(name)
                      setExerciseQuery(name)
                    }}
                    onQuickAdd={quickAddExercise}
                    onSubmit={handleAddExercise}
                  />
                  <button
                    type="button"
                    onClick={handleCancelSession}
                    className="mt-4 w-full rounded-xl py-3 text-sm font-medium text-red-600 ring-1 ring-red-500/25 transition hover:bg-red-500/10 dark:text-red-400"
                  >
                    Cancel session
                  </button>
                </div>
              ) : (
                <>
                  {showAddForm && (
                    <div className="mt-4">
                      <AddExerciseForm
                        variant="compact"
                        exerciseName={exerciseName}
                        exerciseQuery={exerciseQuery}
                        sets={sets}
                        reps={reps}
                        weight={weight}
                        suggestions={exerciseSuggestions}
                        recentExercises={loggedExercises}
                        onQueryChange={(v) => {
                          setExerciseQuery(v)
                          setExerciseName(v)
                        }}
                        onSetsChange={setSets}
                        onRepsChange={setReps}
                        onWeightChange={setWeight}
                        onSelectExercise={(name) => {
                          setExerciseName(name)
                          setExerciseQuery(name)
                        }}
                        onQuickAdd={quickAddExercise}
                        onSubmit={handleAddExercise}
                      />
                    </div>
                  )}

                  <ul className="mt-4 space-y-3">
                    {activeSession.exercises.map((exercise) =>
                      renderExerciseCard(exercise),
                    )}
                  </ul>
                </>
              )}

              {activeSession.exercises.length > 0 && (
                <div className="mt-6 space-y-3 pb-4 lg:pb-8">
                  <textarea
                    value={activeSession.note ?? ''}
                    onChange={(e) => updateSessionNote(e.target.value)}
                    placeholder="Session notes (optional)"
                    rows={2}
                    className="w-full resize-none rounded-xl bg-surface px-4 py-3 text-sm outline-none ring-1 ring-border placeholder:text-muted"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleCancelSession}
                      className="rounded-xl py-3 text-sm font-medium text-red-600 ring-1 ring-red-500/25 transition hover:bg-red-500/10 dark:text-red-400"
                    >
                      Cancel session
                    </button>
                    <Button className="py-3" onClick={handleFinish}>
                      Finish workout
                    </Button>
                  </div>
                </div>
              )}
            </section>
          </div>

          <aside className="hidden px-5 lg:block lg:px-0">
            {selectedExercise || activeSession.exercises[0]?.name ? (
              <div className="sticky top-6">
                <h3 className="mb-3 text-sm font-semibold text-muted">Exercise progress</h3>
                <ExerciseHistoryChart
                  points={getExerciseHistory(
                    sessions,
                    selectedExercise || activeSession.exercises[0]?.name || '',
                  )}
                  height={300}
                />
                <p className="mt-2 text-xs text-muted">
                  Est. 1RM uses the Epley formula. Warmup sets are excluded from volume.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl bg-surface p-6 text-center text-sm text-muted ring-1 ring-border">
                <Dumbbell size={20} className="mx-auto mb-2 opacity-50" />
                Add an exercise to see your progress chart.
              </div>
            )}
          </aside>
        </div>
      )}
      </div>
    </div>
  )
}
