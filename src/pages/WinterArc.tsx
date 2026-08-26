import { Check, ChevronRight, Plus, Snowflake, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  computeWinterArcProgress,
  formatWinterArcEndDate,
  getDailyTasks,
  summarizeDailyTasks,
} from '../lib/winterArc'
import { getTodayWeekday } from '../lib/workoutPlan'
import { useWinterArc } from '../hooks/useWinterArc'
import { useWorkoutPlan } from '../hooks/useWorkoutPlan'
import { useWorkoutTracker } from '../hooks/useWorkoutTracker'
import type { WinterArcDailyTask } from '../types/winterArc'

function HabitRow({
  task,
  onPress,
  onRemove,
}: {
  task: WinterArcDailyTask
  onPress: () => void
  onRemove?: () => void
}) {
  const isWorkout = task.kind === 'workout'

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <button
        type="button"
        onClick={onPress}
        disabled={isWorkout}
        className={isWorkout ? 'cursor-default' : undefined}
        aria-label={task.completed ? 'Done' : 'Mark done'}
      >
        <span
          className={[
            'flex h-6 w-6 items-center justify-center rounded-full ring-1',
            task.completed
              ? 'bg-emerald-500 text-white ring-emerald-500'
              : 'bg-background ring-border',
          ].join(' ')}
        >
          {task.completed ? <Check size={14} strokeWidth={3} /> : null}
        </span>
      </button>

      <button type="button" onClick={onPress} className="min-w-0 flex-1 text-left">
        <p
          className={[
            'text-sm',
            task.completed && !isWorkout ? 'text-muted line-through' : 'font-medium',
          ].join(' ')}
        >
          {task.label}
        </p>
      </button>

      {isWorkout ? (
        <ChevronRight size={18} className="shrink-0 text-muted" />
      ) : onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 text-muted hover:text-red-500"
          aria-label="Remove"
        >
          <Trash2 size={16} />
        </button>
      ) : null}
    </div>
  )
}

export default function WinterArc() {
  const navigate = useNavigate()
  const { state, ready, addTask, removeTask, toggleTask } = useWinterArc()
  const { sessions } = useWorkoutTracker()
  const { plan } = useWorkoutPlan()
  const [draft, setDraft] = useState('')

  const progress = useMemo(
    () => computeWinterArcProgress(sessions, state),
    [sessions, state],
  )

  const habits = useMemo(
    () => getDailyTasks(state, sessions, plan),
    [state, sessions, plan],
  )

  const { completed, total } = useMemo(() => summarizeDailyTasks(habits), [habits])

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    )
  }

  if (!state.enrolled || !progress) {
    return <Navigate to="/profile" replace />
  }

  function handleAdd() {
    if (!draft.trim()) return
    addTask(draft)
    setDraft('')
  }

  function handlePress(task: WinterArcDailyTask) {
    if (task.kind === 'workout') {
      navigate('/tracker/workout', { state: { startDay: getTodayWeekday() } })
      return
    }
    toggleTask(task.id)
  }

  return (
    <div className="min-h-full bg-background pb-24 lg:pb-10">
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-blue-950 text-white">
        <div className="mx-auto max-w-2xl px-5 pb-5 pt-[max(1rem,env(safe-area-inset-top))] lg:px-8 lg:pt-6">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="mb-3 text-sm text-white/60 hover:text-white"
          >
            ← Home
          </button>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                <Snowflake size={18} className="text-sky-200" />
              </span>
              <div>
                <h1 className="text-xl font-semibold">
                  {progress.arcComplete ? 'Arc complete' : `Day ${progress.dayNumber}`}
                </h1>
                {!progress.arcComplete && (
                  <p className="text-xs text-white/55">
                    {progress.daysRemaining}d left · {formatWinterArcEndDate(progress.endDateKey)}
                  </p>
                )}
              </div>
            </div>
            {progress.streak > 0 && (
              <p className="text-sm font-semibold tabular-nums">{progress.streak}🔥</p>
            )}
          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-sky-400"
              style={{ width: `${progress.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-5 py-5 lg:px-8">
        {!progress.arcComplete && (
          <section className="overflow-hidden rounded-2xl border border-border bg-surface ring-1 ring-border">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold">Daily habits</p>
              <p className="text-sm tabular-nums text-muted">
                {completed}/{total}
              </p>
            </div>

            <ul className="divide-y divide-border">
              {habits.map((task) => (
                <li key={task.id}>
                  <HabitRow
                    task={task}
                    onPress={() => handlePress(task)}
                    onRemove={task.kind === 'habit' ? () => removeTask(task.id) : undefined}
                  />
                </li>
              ))}
            </ul>

            <div className="flex gap-2 border-t border-border p-3">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAdd()
                  }
                }}
                placeholder="Add habit"
                className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted"
              />
              <button
                type="button"
                onClick={handleAdd}
                disabled={!draft.trim()}
                className="rounded-xl bg-foreground px-3 py-2 text-background disabled:opacity-40"
                aria-label="Add habit"
              >
                <Plus size={18} />
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
