import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  Check,
  Clock,
  Copy,
  Dumbbell,
  Flame,
  History,
  Plus,
  Search,
  Star,
  Timer,
  Trash2,
  Trophy,
  Weight,
  X,
} from 'lucide-react'
import Button from '../components/Button'
import WorkoutCalendar from '../components/WorkoutCalendar'
import ExerciseHistoryChart from '../components/tracker/ExerciseHistoryChart'
import { exerciseGuides } from '../data/exerciseGuides'
import { heroImage } from '../data/mockData'
import { findVideoForExercise } from '../data/workoutVideos'
import { useWorkoutTracker } from '../hooks/useWorkoutTracker'
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

type View = 'workout' | 'history' | 'progress'

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

function isExerciseComplete(exercise: TrackedExercise) {
  return exercise.sets.length > 0 && exercise.sets.every((s) => s.completed)
}

function toDateKey(iso: string) {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function Tracker() {
  const navigate = useNavigate()
  const {
    sessions,
    activeSession,
    startSession,
    addExercise,
    removeExercise,
    addSetToExercise,
    updateSet,
    toggleSetComplete,
    toggleSetWarmup,
    removeSet,
    finishSession,
    duplicateSession,
    deleteSession,
    updateSessionName,
    updateSessionNote,
    setActiveSession,
  } = useWorkoutTracker()

  const [view, setView] = useState<View>('workout')
  const [tick, setTick] = useState(0)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showFinishSummary, setShowFinishSummary] = useState<WorkoutSession | null>(null)
  const [restSeconds, setRestSeconds] = useState<number | null>(null)
  const [selectedHistoryDay, setSelectedHistoryDay] = useState<string | null>(null)
  const [selectedExercise, setSelectedExercise] = useState('')
  const [exerciseQuery, setExerciseQuery] = useState('')

  const [exerciseName, setExerciseName] = useState('')
  const [sets, setSets] = useState('4')
  const [reps, setReps] = useState('10')
  const [weight, setWeight] = useState('')

  useEffect(() => {
    if (!activeSession || activeSession.completedAt) return
    const id = window.setInterval(() => setTick((t) => t + 1), 1000)
    return () => window.clearInterval(id)
  }, [activeSession])

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

  const exerciseHistory = useMemo(
    () => (selectedExercise ? getExerciseHistory(sessions, selectedExercise) : []),
    [sessions, selectedExercise],
  )

  const exerciseSuggestions = useMemo(() => {
    const q = exerciseQuery.trim().toLowerCase()
    if (!q) return exerciseGuides.slice(0, 8)
    return exerciseGuides.filter((e) => e.name.toLowerCase().includes(q)).slice(0, 8)
  }, [exerciseQuery])

  const sessionsOnSelectedDay = useMemo(() => {
    if (!selectedHistoryDay) return []
    return sessions.filter((s) => toDateKey(s.date) === selectedHistoryDay)
  }, [sessions, selectedHistoryDay])

  const recentPRs = useMemo(() => {
    const prs: { exercise: string; date: string }[] = []
    for (let i = 0; i < Math.min(sessions.length, 10); i++) {
      const session = sessions[i]
      const past = sessions.slice(i + 1)
      for (const name of detectSessionPRs(session, past)) {
        prs.push({ exercise: name, date: session.date })
      }
    }
    return prs.slice(0, 5)
  }, [sessions])

  function handleToggleSetComplete(exerciseId: string, setId: string, wasCompleted: boolean) {
    toggleSetComplete(exerciseId, setId)
    if (!wasCompleted) setRestSeconds(90)
  }

  function handleAddExercise(e: FormEvent) {
    e.preventDefault()
    const setCount = parseInt(sets, 10)
    const repCount = parseInt(reps, 10)
    const weightVal = weight ? parseFloat(weight) : undefined

    if (!exerciseName.trim() || setCount < 1 || repCount < 1) return

    addExercise(exerciseName, setCount, repCount, weightVal)
    setExerciseName('')
    setSets('4')
    setReps('10')
    setWeight('')
    setExerciseQuery('')
    setShowAddForm(false)
    setSelectedExercise(exerciseName.trim())
  }

  function handleFinish() {
    const completed = finishSession()
    if (completed) {
      setShowFinishSummary(completed)
      setView('workout')
    }
  }

  function renderExerciseCard(exercise: TrackedExercise, index: number) {
    const done = isExerciseComplete(exercise)
    const lastLog = findLastExerciseLog(sessions, exercise.name)
    const lastPerf = lastLog ? formatLastPerformance(lastLog) : null

    return (
      <li
        key={exercise.id}
        className="rounded-2xl bg-surface p-3 ring-1 ring-border"
      >
        <div className="flex gap-3">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-black">
            {(() => {
              const video = findVideoForExercise(exercise.name)
              if (video?.available) {
                return (
                  <video
                    src={video.videoPath}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="h-full w-full object-cover"
                  />
                )
              }
              return (
                <img src={heroImage} alt="" className="h-full w-full object-cover opacity-60" />
              )
            })()}
            <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-[10px] font-bold text-white">
              {index + 1}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedExercise(exercise.name)
                    setView('progress')
                  }}
                  className="truncate text-left font-semibold hover:underline"
                >
                  {exercise.name}
                </button>
                {lastPerf && (
                  <p className="mt-0.5 text-xs text-muted">
                    Last time: <span className="text-foreground">{lastPerf}</span>
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => removeExercise(exercise.id)}
                  className="text-muted hover:text-red-500"
                  aria-label={`Remove ${exercise.name}`}
                >
                  <Trash2 size={14} />
                </button>
                <div
                  className={[
                    'flex h-8 w-8 items-center justify-center rounded-full',
                    done ? 'bg-accent text-accent-foreground' : 'bg-surface-elevated text-muted',
                  ].join(' ')}
                >
                  <Check size={16} />
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {exercise.sets.map((set, setIndex) => (
                <div
                  key={set.id}
                  className={[
                    'flex items-center gap-2 rounded-xl px-2 py-1.5',
                    set.isWarmup ? 'bg-amber-500/10 ring-1 ring-amber-500/20' : 'bg-background/50',
                  ].join(' ')}
                >
                  <span className="w-5 text-center text-[10px] font-medium text-muted">
                    {setIndex + 1}
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={set.weight ?? ''}
                    onChange={(e) =>
                      updateSet(
                        exercise.id,
                        set.id,
                        set.reps,
                        e.target.value ? parseFloat(e.target.value) : undefined,
                      )
                    }
                    placeholder="kg"
                    className="w-16 rounded-lg bg-surface px-2 py-1.5 text-center text-sm outline-none ring-1 ring-border"
                  />
                  <span className="text-xs text-muted">×</span>
                  <input
                    type="number"
                    min={1}
                    value={set.reps}
                    onChange={(e) =>
                      updateSet(
                        exercise.id,
                        set.id,
                        parseInt(e.target.value, 10) || 1,
                        set.weight,
                      )
                    }
                    className="w-14 rounded-lg bg-surface px-2 py-1.5 text-center text-sm outline-none ring-1 ring-border"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSetWarmup(exercise.id, set.id)}
                    className={[
                      'rounded-lg px-2 py-1 text-[10px] font-medium',
                      set.isWarmup ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300' : 'text-muted hover:bg-surface-elevated',
                    ].join(' ')}
                  >
                    W
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleSetComplete(exercise.id, set.id, !!set.completed)}
                    className={[
                      'ml-auto flex h-8 w-8 items-center justify-center rounded-full transition',
                      set.completed
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-surface-elevated text-muted hover:text-foreground',
                    ].join(' ')}
                  >
                    <Check size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSet(exercise.id, set.id)}
                    className="text-muted hover:text-red-500"
                    aria-label={`Remove set ${setIndex + 1}`}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const last = exercise.sets[exercise.sets.length - 1]
                  addSetToExercise(exercise.id, last?.reps ?? 10, last?.weight)
                }}
                className="flex w-full items-center justify-center gap-1 rounded-xl py-2 text-xs font-medium text-muted ring-1 ring-dashed ring-border hover:text-foreground"
              >
                <Plus size={12} />
                Add set
              </button>
            </div>
          </div>
        </div>
      </li>
    )
  }

  return (
    <div className="min-h-full bg-background text-foreground">
      <header className="flex items-center justify-between px-5 py-4 lg:px-10">
        <button
          type="button"
          onClick={() => navigate('/home')}
          aria-label="Back to home"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-muted transition hover:bg-surface hover:text-foreground"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-semibold">Progress Tracker</h1>
        <button
          type="button"
          onClick={() => setRestSeconds(90)}
          aria-label="Rest timer"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-muted transition hover:bg-surface hover:text-foreground"
        >
          <Timer size={20} />
        </button>
      </header>

      <nav className="mx-5 mb-4 flex gap-1 rounded-2xl bg-surface p-1 ring-1 ring-border lg:mx-10">
        {(
          [
            { id: 'workout' as const, label: 'Workout', icon: Dumbbell },
            { id: 'history' as const, label: 'History', icon: History },
            { id: 'progress' as const, label: 'Progress', icon: BarChart3 },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            className={[
              'flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-medium transition',
              view === id
                ? 'bg-foreground text-background'
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
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
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

      {view === 'history' && (
        <section className="px-5 pb-8 lg:px-10">
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
                                setView('workout')
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
        </section>
      )}

      {view === 'progress' && (
        <section className="px-5 pb-8 lg:px-10">
          <div className="lg:grid lg:grid-cols-2 lg:gap-6">
            <div>
              <label className="text-sm font-medium text-muted">Exercise</label>
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="mt-2 w-full rounded-xl bg-surface px-4 py-3 text-sm outline-none ring-1 ring-border"
              >
                <option value="">Select an exercise</option>
                {loggedExercises.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>

              {selectedExercise && (
                <div className="mt-4">
                  <ExerciseHistoryChart points={exerciseHistory} height={220} />
                </div>
              )}

              {recentPRs.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
                    <Star size={14} />
                    Recent PRs
                  </h3>
                  <ul className="space-y-2">
                    {recentPRs.map((pr, i) => (
                      <li
                        key={`${pr.exercise}-${pr.date}-${i}`}
                        className="flex items-center justify-between rounded-xl bg-surface px-3 py-2 text-sm ring-1 ring-border"
                      >
                        <span className="font-medium">{pr.exercise}</span>
                        <span className="text-xs text-muted">{formatDate(pr.date)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {selectedExercise && (
              <div className="mt-6 lg:mt-8">
                <h3 className="mb-3 text-sm font-semibold">Session history</h3>
                {exerciseHistory.length === 0 ? (
                  <p className="text-sm text-muted">No logged sets yet.</p>
                ) : (
                  <div className="overflow-hidden rounded-2xl ring-1 ring-border">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-surface text-xs text-muted">
                        <tr>
                          <th className="px-3 py-2 font-medium">Date</th>
                          <th className="px-3 py-2 font-medium">Est. 1RM</th>
                          <th className="px-3 py-2 font-medium">Volume</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...exerciseHistory].reverse().map((row) => (
                          <tr key={row.date} className="border-t border-border">
                            <td className="px-3 py-2">{row.label}</td>
                            <td className="px-3 py-2 font-medium">{row.est1RM} kg</td>
                            <td className="px-3 py-2 text-muted">
                              {row.volume.toLocaleString()} kg
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {view === 'workout' && !activeSession && (
        <section className="px-5 pb-8 lg:px-10">
          <div className="relative overflow-hidden rounded-3xl">
            <img src={heroImage} alt="" className="h-56 w-full object-cover opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-end p-8 text-center text-white">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
                Ready to train
              </p>
              <h2 className="mt-2 text-2xl font-bold">Start your session</h2>
              <p className="mt-2 max-w-xs text-sm text-white/70">
                Log sets, track volume, and watch your strength grow over time.
              </p>
              <Button
                className="mt-6 w-full max-w-xs py-3.5"
                onClick={() => startSession("Today's Workout")}
              >
                Start Empty Workout
              </Button>
            </div>
          </div>

          {sessions.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-muted">Repeat last workout</h3>
              <button
                type="button"
                onClick={() => duplicateSession(sessions[0].id)}
                className="flex w-full items-center justify-between rounded-2xl bg-surface p-4 text-left ring-1 ring-border transition hover:ring-foreground/20"
              >
                <div>
                  <p className="font-semibold">{sessions[0].name}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {formatDate(sessions[0].date)} · {sessions[0].exercises.length} exercises
                  </p>
                </div>
                <Copy size={18} className="text-muted" />
              </button>
            </div>
          )}
        </section>
      )}

      {view === 'workout' && activeSession && (
        <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:px-10">
          <div>
            <section className="relative mx-5 overflow-hidden rounded-3xl lg:mx-0">
              <img src={heroImage} alt="" className="h-44 w-full object-cover lg:h-52" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
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
                <button
                  type="button"
                  onClick={() => setShowAddForm((v) => !v)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-muted ring-1 ring-border hover:text-foreground"
                  aria-label="Add exercise"
                >
                  <Plus size={16} />
                </button>
              </div>

              {showAddForm && (
                <form
                  onSubmit={handleAddExercise}
                  className="mt-4 rounded-2xl bg-surface p-4 ring-1 ring-border"
                >
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-3.5 text-muted" />
                    <input
                      type="text"
                      placeholder="Search exercises..."
                      value={exerciseQuery || exerciseName}
                      onChange={(e) => {
                        setExerciseQuery(e.target.value)
                        setExerciseName(e.target.value)
                      }}
                      className="w-full rounded-xl bg-background py-3 pl-9 pr-4 text-sm outline-none ring-1 ring-border"
                      required
                    />
                  </div>
                  {exerciseSuggestions.length > 0 && (
                    <ul className="mt-2 max-h-36 overflow-y-auto rounded-xl bg-background ring-1 ring-border">
                      {exerciseSuggestions.map((ex) => (
                        <li key={ex.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setExerciseName(ex.name)
                              setExerciseQuery(ex.name)
                            }}
                            className="block w-full px-3 py-2 text-left text-sm hover:bg-surface-elevated"
                          >
                            {ex.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      min={1}
                      placeholder="Sets"
                      value={sets}
                      onChange={(e) => setSets(e.target.value)}
                      className="rounded-xl bg-background px-3 py-2.5 text-center text-sm outline-none ring-1 ring-border"
                    />
                    <input
                      type="number"
                      min={1}
                      placeholder="Reps"
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                      className="rounded-xl bg-background px-3 py-2.5 text-center text-sm outline-none ring-1 ring-border"
                    />
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      placeholder="kg"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="rounded-xl bg-background px-3 py-2.5 text-center text-sm outline-none ring-1 ring-border"
                    />
                  </div>
                  <Button type="submit" fullWidth className="mt-3 py-2.5">
                    Add exercise
                  </Button>
                </form>
              )}

              {activeSession.exercises.length === 0 ? (
                <div className="mt-4 rounded-2xl bg-surface px-6 py-10 text-center ring-1 ring-border">
                  <p className="text-muted">No exercises yet</p>
                  <p className="mt-1 text-sm text-muted">Tap + to add your first exercise</p>
                </div>
              ) : (
                <ul className="mt-4 space-y-3">
                  {activeSession.exercises.map((exercise, index) =>
                    renderExerciseCard(exercise, index),
                  )}
                </ul>
              )}

              {activeSession.exercises.length > 0 && (
                <div className="mt-6 space-y-3 pb-8">
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
                      onClick={() => setActiveSession(null)}
                      className="rounded-xl py-3 text-sm font-medium text-muted ring-1 ring-border hover:text-foreground"
                    >
                      Discard
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
                  height={260}
                />
                <p className="mt-2 text-xs text-muted">
                  Est. 1RM uses the Epley formula. Warmup sets are excluded from volume.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl bg-surface p-6 text-center text-sm text-muted ring-1 ring-border">
                Add an exercise to see its progress chart here.
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  )
}
