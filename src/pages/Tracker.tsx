import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  BarChart3,
  Check,
  Clock,
  Dumbbell,
  Flame,
  MoreVertical,
  NotebookPen,
  Plus,
  Timer,
  Trash2,
  Weight,
} from 'lucide-react'
import Button from '../components/Button'
import { heroImage } from '../data/mockData'
import { findVideoForExercise } from '../data/workoutVideos'
import { useWorkoutTracker } from '../hooks/useWorkoutTracker'
import type { TrackedExercise, WorkoutSession } from '../types/tracker'

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
  const start = new Date(session.startedAt ?? session.date).getTime()
  return Math.max(0, Math.floor((Date.now() - start) / 1000))
}

function getSessionStats(session: WorkoutSession) {
  const allSets = session.exercises.flatMap((ex) => ex.sets)
  const completedSets = allSets.filter((s) => s.completed)
  const totalSets = allSets.length
  const progress = totalSets > 0 ? Math.round((completedSets.length / totalSets) * 100) : 0
  const volume = allSets.reduce((sum, s) => sum + s.reps * (s.weight ?? 0), 0)
  const elapsed = getElapsedSeconds(session)
  const minutes = Math.max(1, Math.floor(elapsed / 60))
  const calories = Math.round(minutes * 7.1)

  return { progress, volume, elapsed, calories, completedSets: completedSets.length, totalSets }
}

function isExerciseComplete(exercise: TrackedExercise) {
  return exercise.sets.length > 0 && exercise.sets.every((s) => s.completed)
}

function getRepRange(exercise: TrackedExercise) {
  const reps = exercise.sets.map((s) => s.reps)
  const min = Math.min(...reps)
  const max = Math.max(...reps)
  return min === max ? `${min}` : `${min}–${max}`
}

function getExerciseSubtitle(session: WorkoutSession) {
  if (session.exercises.length === 0) return 'Add exercises to begin'
  const names = session.exercises.slice(0, 3).map((e) => e.name)
  return names.join(' • ')
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
    toggleSetComplete,
    removeSet,
    finishSession,
    deleteSession,
    updateSessionName,
    updateSessionNote,
    setActiveSession,
  } = useWorkoutTracker()

  const [tick, setTick] = useState(0)
  const [showHistory, setShowHistory] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showNote, setShowNote] = useState(false)
  const [restSeconds, setRestSeconds] = useState<number | null>(null)

  const [exerciseName, setExerciseName] = useState('')
  const [sets, setSets] = useState('4')
  const [reps, setReps] = useState('10')
  const [weight, setWeight] = useState('')

  useEffect(() => {
    if (!activeSession) return
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
    () => (activeSession ? getSessionStats(activeSession) : null),
    [activeSession, tick],
  )

  const completedExercises = activeSession?.exercises.filter(isExerciseComplete).length ?? 0
  const totalExercises = activeSession?.exercises.length ?? 0

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
    setShowAddForm(false)
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
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setRestSeconds(90)}
            aria-label="Rest timer"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-muted transition hover:bg-surface hover:text-foreground"
          >
            <Timer size={20} />
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu((v) => !v)}
              aria-label="Menu"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-muted transition hover:bg-surface hover:text-foreground"
            >
              <MoreVertical size={20} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-11 z-20 min-w-40 rounded-xl bg-surface py-1 shadow-xl ring-1 ring-border">
                <button
                  type="button"
                  onClick={() => {
                    setShowHistory((v) => !v)
                    setShowMenu(false)
                  }}
                  className="block w-full px-4 py-2.5 text-left text-sm hover:bg-surface-elevated"
                >
                  {showHistory ? 'Active session' : 'History'}
                </button>
                {activeSession && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSession(null)
                      setShowMenu(false)
                    }}
                    className="block w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-surface-elevated"
                  >
                    Discard session
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {restSeconds !== null && restSeconds > 0 && (
        <div className="mx-5 mb-4 flex items-center justify-between rounded-2xl bg-foreground/5 px-4 py-3 ring-1 ring-border lg:mx-10">
          <span className="text-sm font-medium">Rest timer</span>
          <span className="text-lg font-bold">{formatElapsed(restSeconds)}</span>
          <button
            type="button"
            onClick={() => setRestSeconds(null)}
            className="text-xs text-muted hover:text-foreground"
          >
            Skip
          </button>
        </div>
      )}

      {showHistory ? (
        <section className="px-5 pb-8 lg:px-10">
          <h2 className="mb-4 text-lg font-bold">Past Workouts</h2>
          {sessions.length === 0 ? (
            <div className="rounded-2xl bg-surface px-6 py-12 text-center ring-1 ring-border">
              <Dumbbell className="mx-auto mb-3 text-muted" size={32} />
              <p className="font-medium">No workouts logged yet</p>
              <p className="mt-1 text-sm text-muted">Finish a session to see it here.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {sessions.map((session) => {
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
                          {pastStats.volume.toLocaleString()} kg volume
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteSession(session.id)}
                        aria-label="Delete workout"
                        className="text-muted transition hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      ) : !activeSession ? (
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
                Log exercises, track sets, and watch your progress grow.
              </p>
              <Button
                className="mt-6 w-full max-w-xs py-3.5"
                onClick={() => startSession('Push Day')}
              >
                Start Workout
              </Button>
            </div>
          </div>
        </section>
      ) : (
        <>
          <section className="relative mx-5 overflow-hidden rounded-3xl lg:mx-10">
            <img src={heroImage} alt="" className="h-52 w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />

            <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">
                Current workout
              </p>
              <input
                type="text"
                value={activeSession.name}
                onChange={(e) => updateSessionName(e.target.value)}
                className="mt-1 w-full bg-transparent text-2xl font-bold outline-none placeholder:text-white/50"
                placeholder="Workout name"
              />
              <p className="mt-1 truncate text-sm text-white/70">
                {getExerciseSubtitle(activeSession)}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="flex items-center gap-1.5 text-xs text-white/60">
                    <Clock size={12} />
                    Time elapsed
                  </p>
                  <p className="mt-0.5 text-lg font-bold">
                    {stats ? formatElapsed(stats.elapsed) : '0:00'}
                  </p>
                </div>
                <div>
                  <p className="flex items-center gap-1.5 text-xs text-white/60">
                    <Flame size={12} />
                    kcal burned
                  </p>
                  <p className="mt-0.5 text-lg font-bold">{stats?.calories ?? 0}</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-xs text-white/70">
                  <span>Progress</span>
                  <span>{stats?.progress ?? 0}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-500"
                    style={{ width: `${stats?.progress ?? 0}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 px-5 lg:px-10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Exercises</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted">
                  {completedExercises} / {totalExercises} completed
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm((v) => !v)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-muted ring-1 ring-border hover:text-foreground"
                  aria-label="Add exercise"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {showAddForm && (
              <form
                onSubmit={handleAddExercise}
                className="mt-4 rounded-2xl bg-surface p-4 ring-1 ring-border"
              >
                <input
                  type="text"
                  placeholder="Exercise name"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  className="w-full rounded-xl bg-background px-4 py-3 text-sm text-foreground outline-none ring-1 ring-border placeholder:text-muted"
                  required
                />
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    min={1}
                    placeholder="Sets"
                    value={sets}
                    onChange={(e) => setSets(e.target.value)}
                    className="rounded-xl bg-background px-3 py-2.5 text-center text-sm text-foreground outline-none ring-1 ring-border"
                  />
                  <input
                    type="number"
                    min={1}
                    placeholder="Reps"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    className="rounded-xl bg-background px-3 py-2.5 text-center text-sm text-foreground outline-none ring-1 ring-border"
                  />
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    placeholder="kg"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="rounded-xl bg-background px-3 py-2.5 text-center text-sm text-foreground outline-none ring-1 ring-border"
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
                {activeSession.exercises.map((exercise, index) => {
                  const done = isExerciseComplete(exercise)
                  const displayWeight =
                    exercise.sets.find((s) => s.weight)?.weight ??
                    exercise.sets[0]?.weight

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
                              <img
                                src={heroImage}
                                alt=""
                                className="h-full w-full object-cover opacity-60"
                              />
                            )
                          })()}
                          <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-[10px] font-bold text-white">
                            {index + 1}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="truncate font-semibold">{exercise.name}</h3>
                              <p className="mt-0.5 text-xs text-muted">
                                {exercise.sets.length} sets • {getRepRange(exercise)} reps
                              </p>
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
                                  done
                                    ? 'bg-accent text-accent-foreground'
                                    : 'bg-surface-elevated text-muted',
                                ].join(' ')}
                              >
                                <Check size={16} />
                              </div>
                            </div>
                          </div>

                          {displayWeight !== undefined && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                              <Weight size={12} />
                              {displayWeight} kg
                            </p>
                          )}

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {exercise.sets.map((set, setIndex) => (
                              <div key={set.id} className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => toggleSetComplete(exercise.id, set.id)}
                                  className={[
                                    'flex h-9 min-w-9 items-center justify-center gap-1 rounded-full px-2 text-xs font-semibold transition',
                                    set.completed
                                      ? 'bg-accent text-accent-foreground'
                                      : 'bg-surface-elevated text-muted hover:text-foreground',
                                  ].join(' ')}
                                >
                                  {set.completed && <Check size={10} />}
                                  {set.reps}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeSet(exercise.id, set.id)}
                                  className="text-muted hover:text-red-500"
                                  aria-label={`Remove set ${setIndex + 1}`}
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const last = exercise.sets[exercise.sets.length - 1]
                                addSetToExercise(exercise.id, last?.reps ?? 10, last?.weight)
                              }}
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-elevated text-muted hover:text-foreground"
                              aria-label="Add set"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          {activeSession.exercises.length > 0 && (
            <section className="mt-8 px-5 pb-8 lg:px-10">
              <div className="rounded-2xl bg-surface p-5 ring-1 ring-border">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold">Workout summary</h2>
                  <span className="text-sm text-muted">Great job! 🎉</span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <Clock size={16} className="mx-auto text-muted" />
                    <p className="mt-1 text-lg font-bold">
                      {stats ? formatElapsed(stats.elapsed) : '0:00'}
                    </p>
                    <p className="text-[10px] text-muted">Total time</p>
                  </div>
                  <div>
                    <Flame size={16} className="mx-auto text-muted" />
                    <p className="mt-1 text-lg font-bold">{stats?.calories ?? 0}</p>
                    <p className="text-[10px] text-muted">kcal burned</p>
                  </div>
                  <div>
                    <BarChart3 size={16} className="mx-auto text-muted" />
                    <p className="mt-1 text-lg font-bold">
                      {stats?.volume.toLocaleString() ?? 0}
                    </p>
                    <p className="text-[10px] text-muted">Volume (kg)</p>
                  </div>
                </div>

                {showNote && (
                  <textarea
                    value={activeSession.note ?? ''}
                    onChange={(e) => updateSessionNote(e.target.value)}
                    placeholder="How did it feel today?"
                    rows={3}
                    className="mt-4 w-full resize-none rounded-xl bg-background px-4 py-3 text-sm text-foreground outline-none ring-1 ring-border placeholder:text-muted"
                  />
                )}

                <div className="mt-5 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRestSeconds(90)}
                    className="flex flex-col items-center gap-1 rounded-xl bg-background py-3 text-xs font-medium text-muted ring-1 ring-border hover:text-foreground"
                  >
                    <Timer size={16} />
                    Rest timer
                  </button>
                  <Button className="py-3" onClick={finishSession}>
                    Finish workout
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowNote((v) => !v)}
                    className="flex flex-col items-center gap-1 rounded-xl bg-background py-3 text-xs font-medium text-muted ring-1 ring-border hover:text-foreground"
                  >
                    <NotebookPen size={16} />
                    Add note
                  </button>
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
