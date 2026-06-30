import { useState } from 'react'
import type { FormEvent } from 'react'
import { Calendar, Dumbbell, Plus, Trash2 } from 'lucide-react'
import Button from '../components/Button'
import Input from '../components/Input'
import { useWorkoutTracker } from '../hooks/useWorkoutTracker'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export default function Tracker() {
  const {
    sessions,
    activeSession,
    startSession,
    addExercise,
    removeExercise,
    addSetToExercise,
    updateSet,
    removeSet,
    finishSession,
    deleteSession,
    updateSessionName,
  } = useWorkoutTracker()

  const [exerciseName, setExerciseName] = useState('')
  const [sets, setSets] = useState('3')
  const [reps, setReps] = useState('10')
  const [weight, setWeight] = useState('')
  const [showHistory, setShowHistory] = useState(false)

  function handleAddExercise(e: FormEvent) {
    e.preventDefault()
    const setCount = parseInt(sets, 10)
    const repCount = parseInt(reps, 10)
    const weightVal = weight ? parseFloat(weight) : undefined

    if (!exerciseName.trim() || setCount < 1 || repCount < 1) return

    addExercise(exerciseName, setCount, repCount, weightVal)
    setExerciseName('')
    setSets('3')
    setReps('10')
    setWeight('')
  }

  const totalSets =
    activeSession?.exercises.reduce((sum, ex) => sum + ex.sets.length, 0) ?? 0
  const totalReps =
    activeSession?.exercises.reduce(
      (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.reps, 0),
      0,
    ) ?? 0

  return (
    <div className="px-5 pt-8 lg:px-10 lg:pt-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-500">Log your progress</p>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Workout Tracker</h1>
        </div>
        <button
          type="button"
          onClick={() => setShowHistory((v) => !v)}
          className={[
            'shrink-0 rounded-2xl px-4 py-2.5 text-sm font-semibold transition',
            showHistory ? 'bg-black text-white' : 'bg-surface text-black hover:bg-neutral-200',
          ].join(' ')}
        >
          {showHistory ? 'Active' : 'History'}
        </button>
      </header>

      {showHistory ? (
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-bold">Past Workouts</h2>
          {sessions.length === 0 ? (
            <div className="rounded-2xl bg-surface px-6 py-10 text-center text-neutral-500">
              <Dumbbell className="mx-auto mb-3 text-neutral-400" size={32} />
              <p className="font-medium text-black">No workouts logged yet</p>
              <p className="mt-1 text-sm">Finish a session to see it here.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {sessions.map((session) => (
                <li
                  key={session.id}
                  className="rounded-2xl bg-surface p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{session.name}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-neutral-500">
                        <Calendar size={14} />
                        {formatDate(session.date)}
                      </p>
                      <p className="mt-2 text-sm text-neutral-600">
                        {session.exercises.length} exercises ·{' '}
                        {session.exercises.reduce((s, ex) => s + ex.sets.length, 0)} sets
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteSession(session.id)}
                      aria-label="Delete workout"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-neutral-400 transition hover:bg-white hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <ul className="mt-3 space-y-2 border-t border-neutral-200/80 pt-3">
                    {session.exercises.map((ex) => (
                      <li key={ex.id} className="text-sm">
                        <span className="font-medium">{ex.name}</span>
                        <span className="text-neutral-500">
                          {' '}
                          — {ex.sets.map((s) => `${s.reps}${s.weight ? `×${s.weight}kg` : ''}`).join(', ')}
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <>
          {!activeSession ? (
            <div className="mt-10 rounded-3xl bg-surface p-8 text-center">
              <Dumbbell className="mx-auto mb-4 text-neutral-400" size={40} />
              <h2 className="text-lg font-bold">Start a workout</h2>
              <p className="mt-2 text-sm text-neutral-500">
                Log exercises, sets, and reps for today&apos;s session.
              </p>
              <Button className="mt-6" onClick={() => startSession()}>
                Start Workout
              </Button>
            </div>
          ) : (
            <>
              <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl bg-surface p-4">
                <input
                  type="text"
                  value={activeSession.name}
                  onChange={(e) => updateSessionName(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-lg font-bold outline-none"
                  placeholder="Workout name"
                />
                <div className="flex gap-4 text-sm text-neutral-500">
                  <span>{activeSession.exercises.length} exercises</span>
                  <span>{totalSets} sets</span>
                  <span>{totalReps} reps</span>
                </div>
              </div>

              <form onSubmit={handleAddExercise} className="mt-6 rounded-2xl border border-neutral-100 p-5">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
                  Add Exercise
                </h2>
                <div className="space-y-4">
                  <Input
                    label="Exercise"
                    placeholder="e.g. Bench Press"
                    value={exerciseName}
                    onChange={(e) => setExerciseName(e.target.value)}
                    required
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      label="Sets"
                      type="number"
                      min={1}
                      max={20}
                      value={sets}
                      onChange={(e) => setSets(e.target.value)}
                      required
                    />
                    <Input
                      label="Reps"
                      type="number"
                      min={1}
                      max={100}
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                      required
                    />
                    <Input
                      label="Weight (kg)"
                      type="number"
                      min={0}
                      step={0.5}
                      placeholder="Optional"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>
                  <Button type="submit" fullWidth variant="outline" className="gap-2">
                    <Plus size={18} />
                    Add Exercise
                  </Button>
                </div>
              </form>

              {activeSession.exercises.length > 0 && (
                <section className="mt-6">
                  <h2 className="mb-4 text-lg font-bold">Today&apos;s Exercises</h2>
                  <ul className="space-y-4">
                    {activeSession.exercises.map((exercise) => (
                      <li
                        key={exercise.id}
                        className="rounded-2xl bg-surface p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="font-semibold">{exercise.name}</h3>
                          <button
                            type="button"
                            onClick={() => removeExercise(exercise.id)}
                            aria-label={`Remove ${exercise.name}`}
                            className="text-neutral-400 transition hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <ul className="mt-3 space-y-2">
                          {exercise.sets.map((set, index) => (
                            <li
                              key={set.id}
                              className="flex items-center gap-2 rounded-xl bg-white p-2"
                            >
                              <span className="w-12 shrink-0 text-xs font-semibold text-neutral-400">
                                Set {index + 1}
                              </span>
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
                                className="w-16 rounded-lg bg-surface px-2 py-1.5 text-center text-sm font-medium outline-none focus:ring-1 focus:ring-neutral-300"
                                aria-label={`Set ${index + 1} reps`}
                              />
                              <span className="text-xs text-neutral-400">reps</span>
                              <input
                                type="number"
                                min={0}
                                step={0.5}
                                placeholder="kg"
                                value={set.weight ?? ''}
                                onChange={(e) =>
                                  updateSet(
                                    exercise.id,
                                    set.id,
                                    set.reps,
                                    e.target.value ? parseFloat(e.target.value) : undefined,
                                  )
                                }
                                className="w-16 rounded-lg bg-surface px-2 py-1.5 text-center text-sm outline-none focus:ring-1 focus:ring-neutral-300"
                                aria-label={`Set ${index + 1} weight`}
                              />
                              <span className="text-xs text-neutral-400">kg</span>
                              <button
                                type="button"
                                onClick={() => removeSet(exercise.id, set.id)}
                                aria-label={`Remove set ${index + 1}`}
                                className="ml-auto text-neutral-300 transition hover:text-red-500"
                              >
                                <Trash2 size={14} />
                              </button>
                            </li>
                          ))}
                        </ul>

                        <button
                          type="button"
                          onClick={() => {
                            const last = exercise.sets[exercise.sets.length - 1]
                            addSetToExercise(exercise.id, last?.reps ?? 10, last?.weight)
                          }}
                          className="mt-3 flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition hover:text-black"
                        >
                          <Plus size={14} />
                          Add set
                        </button>
                      </li>
                    ))}
                  </ul>

                  <Button
                    fullWidth
                    className="mt-6"
                    onClick={finishSession}
                  >
                    Finish Workout
                  </Button>
                </section>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
