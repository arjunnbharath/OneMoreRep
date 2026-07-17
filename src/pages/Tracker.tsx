import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation } from 'react-router-dom'
import {
  BarChart3,
  Calendar,
  ChevronRight,
  Clock,
  Copy,
  Dumbbell,
  Flame,
  History,
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
import ProgressVolumeChart from '../components/tracker/ProgressVolumeChart'
import FriendsPanel from '../components/tracker/FriendsPanel'
import AddExerciseForm from '../components/tracker/AddExerciseForm'
import ExerciseSetTable from '../components/tracker/ExerciseSetTable'
import NextMuscleReady from '../components/tracker/NextMuscleReady'
import ReadyToTrainPanel from '../components/tracker/ReadyToTrainPanel'
import WeeklyPlanPanel from '../components/tracker/WeeklyPlanPanel'
import MuscleExerciseList from '../components/home/MuscleExerciseList'
import { exerciseGuides, type ExerciseGroup } from '../data/exerciseGuides'
import { heroImage } from '../data/mockData'
import { useWorkoutPlan } from '../hooks/useWorkoutPlan'
import { useWorkoutTracker } from '../hooks/useWorkoutTracker'
import {
  exercisesForMuscle,
  getTodayWeekday,
  groupLabel,
  muscleQueueForDay,
  WEEKDAY_LABELS,
} from '../lib/workoutPlan'
import {
  detectSessionPRs,
  findLastExerciseLog,
  formatLastPerformance,
  getExerciseHistory,
  getLoggedExerciseNames,
  getMonthlyProgress,
  getSessionDurationSeconds,
  getWeeklyProgress,
  sessionVolume,
} from '../lib/workoutProgress'
import type { TrackedExercise, WorkoutSession } from '../types/tracker'
import type { Weekday } from '../types/workoutPlan'

type View = 'workout' | 'plan' | 'progress' | 'friends'

const TRACKER_VIEW_KEY = 'onemorerep-tracker-view'
const WORKOUT_HISTORY_BG = '/images/gym_background/workout history.jpg'

function isTrackerView(value: string): value is View {
  return value === 'workout' || value === 'plan' || value === 'progress' || value === 'friends'
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

type DayWorkoutFlow = {
  day: Weekday
  queue: ExerciseGroup[]
  remaining: ExerciseGroup[]
}

export default function Tracker() {
  const location = useLocation()
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
    addMuscleToDay,
    removeMuscleFromDay,
    addExercise: addPlanExercise,
    removeExercise: removePlanExercise,
  } = useWorkoutPlan()

  const [view, setView] = useState<View>('plan')
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
  const [showWorkoutHistory, setShowWorkoutHistory] = useState(false)
  const [selectedHistoryDay, setSelectedHistoryDay] = useState<string | null>(null)
  const [selectedExercise, setSelectedExercise] = useState('')
  const [exerciseQuery, setExerciseQuery] = useState('')

  const [exerciseName, setExerciseName] = useState('')
  const [sets, setSets] = useState('3')
  const [reps, setReps] = useState('12')
  const [weight, setWeight] = useState('')

  useEffect(() => {
    if (view !== 'workout') {
      setShowWorkoutHistory(false)
    }
  }, [view])

  useEffect(() => {
    if (view === 'plan') {
      setPlanSwipeHintKey((key) => key + 1)
    }
  }, [view])

  useEffect(() => {
    const savedView = sessionStorage.getItem(TRACKER_VIEW_KEY)
    if (savedView && isTrackerView(savedView)) {
      setView(savedView)
      sessionStorage.removeItem(TRACKER_VIEW_KEY)
    }
  }, [])

  function rememberTrackerView() {
    sessionStorage.setItem(TRACKER_VIEW_KEY, view)
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

  useEffect(() => {
    if (restSeconds === null || restSeconds <= 0) return
    const id = window.setInterval(() => {
      setRestSeconds((s) => (s !== null && s > 0 ? s - 1 : 0))
    }, 1000)
    return () => window.clearInterval(id)
  }, [restSeconds])

  const stats = useMemo(
    () => (activeSession ? getSessionStats(activeSession, true) : null),
    [activeSession, tick],
  )

  const loggedExercises = useMemo(() => getLoggedExerciseNames(sessions), [sessions])

  const weeklyProgress = useMemo(() => getWeeklyProgress(sessions), [sessions])
  const monthlyProgress = useMemo(() => getMonthlyProgress(sessions), [sessions])

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
    if (!wasCompleted) setRestSeconds(90)
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
    setView('workout')
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
    const state = location.state as { view?: View; startDay?: Weekday } | null
    if (!state?.view && !state?.startDay) return

    if (state.view && isTrackerView(state.view)) setView(state.view)
    if (state.startDay) handleStartDayPlanRef.current(state.startDay)

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
                setView('progress')
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
    <div className="min-h-full bg-background text-foreground lg:mx-auto lg:max-w-7xl">
      <header className="hidden border-b border-border lg:block lg:px-10 lg:py-6">
        <div className="flex items-center justify-between gap-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
              Training
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">Progress</h1>
          </div>

          <nav className="flex gap-1 rounded-2xl bg-surface p-1 shadow-sm ring-1 ring-border">
            {(
              [
                { id: 'plan' as const, label: 'Plans', icon: Calendar },
                { id: 'workout' as const, label: 'Workout', icon: Dumbbell },
                { id: 'progress' as const, label: 'Stats', icon: BarChart3 },
                { id: 'friends' as const, label: 'Friends', icon: Users },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setView(id)}
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

      <nav className="mx-5 mb-4 mt-[max(2.5rem,env(safe-area-inset-top))] flex gap-1 rounded-2xl bg-surface p-1 shadow-sm ring-1 ring-border lg:hidden">
        {(
          [
            { id: 'plan' as const, label: 'Plans', icon: Calendar },
            { id: 'workout' as const, label: 'Workout', icon: Dumbbell },
            { id: 'progress' as const, label: 'Stats', icon: BarChart3 },
            { id: 'friends' as const, label: 'Friends', icon: Users },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
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

      {restSeconds !== null && restSeconds > 0 && (
        <div className="mx-5 mb-4 flex items-center justify-between rounded-2xl bg-foreground/5 px-4 py-3 ring-1 ring-border lg:mx-10">
          <span className="text-sm font-medium">Rest timer</span>
          <span className="text-lg font-bold tabular-nums">{formatElapsed(restSeconds)}</span>
          <button
            type="button"
            onClick={() => setRestSeconds(null)}
            className="text-xs text-muted hover:text-foreground"
          >
            Skip
          </button>
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
        showWorkoutHistory ? (
          <section className="px-5 pb-8 lg:px-10">
            <div className="mx-auto max-w-lg lg:max-w-4xl">
              <button
                type="button"
                onClick={() => {
                  setShowWorkoutHistory(false)
                  setSelectedHistoryDay(null)
                }}
                className="mb-4 text-sm font-medium text-muted transition hover:text-foreground"
              >
                ← Back to workout
              </button>

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
                                    setShowWorkoutHistory(false)
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
          <section className="space-y-5 px-5 pb-8 lg:desktop-page-body lg:px-10">
            <div className="desktop-page mx-auto max-w-lg lg:max-w-3xl">
              <ReadyToTrainPanel
                plan={plan}
                lastSession={sessions[0] ?? null}
                onStartToday={() => handleStartDayPlan(getTodayWeekday())}
                onStartEmpty={() => startSession("Today's Workout")}
                onEditPlan={() => setView('plan')}
                onRepeatLast={
                  sessions[0]
                    ? () => duplicateSession(sessions[0].id)
                    : undefined
                }
                formatSessionDate={formatDate}
              />
            </div>

            <div className="desktop-page mx-auto max-w-lg lg:max-w-3xl">
              <button
                type="button"
                onClick={() => setShowWorkoutHistory(true)}
                className="group relative w-full overflow-hidden rounded-2xl text-left ring-1 ring-border transition hover:ring-foreground/25"
              >
                <img
                  src={WORKOUT_HISTORY_BG}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/40 to-black/45" />

                <div className="relative flex items-center justify-between gap-3 px-4 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
                      <History size={17} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">Workout history</p>
                      {sessions.length === 0 ? (
                        <p className="text-xs text-white/70">No sessions yet</p>
                      ) : (
                        <>
                          <p className="truncate text-xs text-white/80">
                            Last · {formatDate(sessions[0].date)} · {sessions[0].name}
                          </p>
                          <p className="mt-0.5 text-[11px] text-white/60">
                            {sessions.length} session{sessions.length === 1 ? '' : 's'} logged
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={16} className="shrink-0 text-white/80" />
                </div>
              </button>
            </div>

            <div className="desktop-page mx-auto max-w-lg lg:max-w-3xl">
              <h3 className="mb-1 text-base font-semibold">Workouts</h3>
              <p className="mb-4 text-sm text-muted">Browse exercises by muscle group</p>
              <MuscleExerciseList onBeforeNavigate={rememberTrackerView} />
            </div>
          </section>
        )
      )}

      {view === 'progress' && (
        <section className="space-y-8 px-5 pb-8 pt-4 lg:desktop-page-body lg:px-10 lg:pt-6">
          <div className="desktop-page mx-auto lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-8">
            <div className="min-w-0 space-y-8">
              <ProgressVolumeChart weekly={weeklyProgress} monthly={monthlyProgress} />
            </div>

            <aside className="space-y-6 lg:sticky lg:top-8">
              <div className="rounded-2xl bg-surface p-5 ring-1 ring-border">
                <h3 className="text-sm font-semibold">Quick insights</h3>
                <ul className="mt-4 space-y-3 text-sm text-muted">
                  <li>
                    <span className="font-medium text-foreground">{weeklyProgress.reduce((sum, p) => sum + p.sessions, 0)}</span>{' '}
                    sessions this week
                  </li>
                  <li>
                    <span className="font-medium text-foreground">{monthlyProgress.reduce((sum, p) => sum + p.sessions, 0)}</span>{' '}
                    sessions this month
                  </li>
                  <li>
                    <span className="font-medium text-foreground">
                      {weeklyProgress.reduce((sum, p) => sum + p.volume, 0).toLocaleString()} kg
                    </span>{' '}
                    volume this week
                  </li>
                </ul>
              </div>

              {activeSession && (
                <div className="rounded-2xl bg-surface p-5 ring-1 ring-border">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold">Active session</h3>
                    <button
                      type="button"
                      onClick={() => setView('workout')}
                      className="text-xs font-medium text-foreground underline-offset-2 hover:underline"
                    >
                      Open
                    </button>
                  </div>
                  <p className="text-sm font-medium">{activeSession.name}</p>
                  <p className="mt-1 text-xs text-muted">
                    {activeSession.exercises.length} exercise
                    {activeSession.exercises.length === 1 ? '' : 's'} in progress
                  </p>
                </div>
              )}
            </aside>
          </div>

          {activeSession && (
            <div className="desktop-page mx-auto max-w-none lg:max-w-4xl">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-muted">Workout session</h3>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setView('workout')}
                    className="text-xs font-medium text-foreground underline-offset-2 hover:underline"
                  >
                    Back to workout
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelSession}
                    className="text-xs font-medium text-red-600 underline-offset-2 hover:underline dark:text-red-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {activeSession.exercises.length === 0 ? (
                <p className="rounded-2xl bg-surface p-4 text-sm text-muted ring-1 ring-border">
                  No exercises added yet. Go to Workout to add exercises or cancel the session.
                </p>
              ) : (
                <>
              <ul className="space-y-2">
                {activeSession.exercises.map((exercise) => {
                  const completedSets = exercise.sets.filter((s) => s.completed).length
                  const totalSets = exercise.sets.length
                  const isSelected = selectedExercise === exercise.name

                  return (
                    <li key={exercise.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedExercise(exercise.name)}
                        className={[
                          'flex w-full items-center justify-between gap-3 rounded-2xl p-4 text-left ring-1 transition',
                          isSelected
                            ? 'bg-foreground/10 ring-foreground/30'
                            : 'bg-surface ring-border hover:ring-foreground/20',
                        ].join(' ')}
                      >
                        <div className="min-w-0">
                          <p className="font-semibold">{exercise.name}</p>
                          <p className="mt-0.5 text-xs text-muted">
                            {completedSets}/{totalSets} sets complete
                          </p>
                        </div>
                        <BarChart3
                          size={16}
                          className={isSelected ? 'text-foreground' : 'text-muted'}
                        />
                      </button>
                    </li>
                  )
                })}
              </ul>

              {(selectedExercise || activeSession.exercises[0]?.name) && (
                <div className="mt-6">
                  <h3 className="mb-3 text-sm font-semibold text-muted">Exercise progress</h3>
                  <ExerciseHistoryChart
                    points={getExerciseHistory(
                      sessions,
                      selectedExercise || activeSession.exercises[0]?.name || '',
                    )}
                    height={260}
                  />
                </div>
              )}
                </>
              )}
            </div>
          )}
        </section>
      )}

      {view === 'plan' && (
        <section className="overflow-x-hidden px-5 pb-8 lg:desktop-page-body lg:px-10">
          <div className="desktop-page lg:max-w-5xl">
            <WeeklyPlanPanel
            plan={plan}
            onAddMuscle={addMuscleToDay}
            onRemoveMuscle={removeMuscleFromDay}
            onAddExercise={addPlanExercise}
            onRemoveExercise={removePlanExercise}
            onStartDay={handleStartDayPlan}
            swipeHintKey={planSwipeHintKey}
          />
          </div>
        </section>
      )}

      {view === 'friends' && (
        <section className="px-5 pb-8 lg:desktop-page-body lg:px-10">
          <FriendsPanel />
        </section>
      )}

      {view === 'workout' && !activeSession && readyForNextMuscle && (
        <NextMuscleReady
          day={readyForNextMuscle.day}
          muscle={readyForNextMuscle.muscle}
          plan={plan}
          lastSession={readyForNextMuscle.lastSession}
          onContinue={handleContinueNextMuscle}
          onDone={handleEndDayWorkout}
        />
      )}

      {view === 'workout' && activeSession && (
        <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:px-10">
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
  )
}
