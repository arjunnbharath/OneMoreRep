import { Check, ChevronRight, Plus, Snowflake, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  computeWinterArcProgress,
  formatWinterArcEndDate,
  getDailyTasks,
  summarizeDailyTasks,
  SUGAR_CUT_TASK_ID,
  WORKOUT_TASK_ID,
} from '../lib/winterArc'
import { loggedFoodDaysFromLogs } from '../lib/sugarCut'
import { getTodayWeekday } from '../lib/workoutPlan'
import { useCalorieTracker } from '../hooks/useCalorieTracker'
import { useWinterArc } from '../hooks/useWinterArc'
import { useWorkoutPlan } from '../hooks/useWorkoutPlan'
import { useWorkoutTracker } from '../hooks/useWorkoutTracker'
import type { WinterArcDailyTask } from '../types/winterArc'

function AutoTrackedTaskRow({
  task,
  onClick,
}: {
  task: WinterArcDailyTask
  onClick?: () => void
}) {
  const content = (
    <>
      <span
        className={[
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-1',
          task.completed
            ? 'bg-emerald-500 text-white ring-emerald-500'
            : 'bg-background ring-border',
        ].join(' ')}
      >
        {task.completed ? <Check size={14} strokeWidth={3} /> : null}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{task.label}</p>
        {task.subtitle ? <p className="mt-0.5 text-xs text-muted">{task.subtitle}</p> : null}
      </div>
      {onClick ? <ChevronRight size={18} className="shrink-0 text-muted" /> : null}
    </>
  )

  if (!onClick) {
    return <div className="flex items-center gap-3 px-4 py-4">{content}</div>
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-surface-elevated/60"
    >
      {content}
    </button>
  )
}

export default function WinterArc() {
  const navigate = useNavigate()
  const { state, ready, addTask, removeTask, toggleTask } = useWinterArc()
  const { sessions } = useWorkoutTracker()
  const { plan } = useWorkoutPlan()
  const { sugarByDay, logs } = useCalorieTracker()
  const [draftTask, setDraftTask] = useState('')

  const sugarCutInput = useMemo(
    () => ({
      sugarByDay,
      loggedDays: loggedFoodDaysFromLogs(logs),
    }),
    [sugarByDay, logs],
  )

  const progress = useMemo(
    () => computeWinterArcProgress(sessions, state),
    [sessions, state],
  )

  const dailyTasks = useMemo(
    () => getDailyTasks(state, sessions, plan, sugarCutInput),
    [state, sessions, plan, sugarCutInput],
  )

  const taskSummary = useMemo(() => summarizeDailyTasks(dailyTasks), [dailyTasks])
  const workoutTask = dailyTasks.find((task) => task.id === WORKOUT_TASK_ID)
  const sugarTask = dailyTasks.find((task) => task.id === SUGAR_CUT_TASK_ID)

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

  function handleAddTask() {
    if (!draftTask.trim()) return
    addTask(draftTask)
    setDraftTask('')
  }

  function openWorkout() {
    navigate('/tracker/workout', { state: { startDay: getTodayWeekday() } })
  }

  function openCalories() {
    navigate('/calories')
  }

  return (
    <div className="min-h-full bg-background pb-24 lg:pb-10">
      <div className="overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-blue-950 text-white">
        <div className="mx-auto max-w-2xl px-5 pb-6 pt-[max(1.25rem,env(safe-area-inset-top))] lg:px-8 lg:pt-8">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="mb-4 text-sm text-white/60 transition hover:text-white"
          >
            ← Back to home
          </button>

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                  <Snowflake size={18} className="text-sky-200" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
                    Winter Arc
                  </p>
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {progress.arcComplete ? 'Arc complete' : `Day ${progress.dayNumber}`}
                  </h1>
                </div>
              </div>
              <p className="mt-2 text-sm text-white/60">
                {progress.arcComplete
                  ? `${progress.totalWorkouts} workouts during your arc`
                  : `${progress.daysRemaining} days left · ends ${formatWinterArcEndDate(progress.endDateKey)}`}
              </p>
            </div>

            {progress.streak > 0 && (
              <div className="shrink-0 rounded-xl bg-white/10 px-3 py-2 text-center ring-1 ring-white/10">
                <p className="text-lg font-bold tabular-nums leading-none">{progress.streak}</p>
                <p className="mt-0.5 text-[10px] text-white/50">streak</p>
              </div>
            )}
          </div>

          <div className="mt-5">
            <div className="mb-1.5 flex items-center justify-between text-[11px] text-white/55">
              <span>Arc progress</span>
              <span className="tabular-nums">{progress.progressPercent}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-300 transition-all"
                style={{ width: `${progress.progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-5 px-5 py-6 lg:px-8">
        {!progress.arcComplete && (
          <section className="rounded-2xl border border-border bg-surface p-4 ring-1 ring-border">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                  Today&apos;s tasks
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {taskSummary.completed} of {taskSummary.total} done
                </p>
              </div>
              <span className="rounded-full bg-surface-elevated px-3 py-1 text-xs font-medium text-muted ring-1 ring-border">
                Resets daily
              </span>
            </div>
          </section>
        )}

        <section className="overflow-hidden rounded-2xl border border-border bg-surface ring-1 ring-border">
          <div className="border-b border-border px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              Daily habits
            </p>
            <p className="mt-1 text-sm text-muted">
              Auto-tracked from your workouts and calorie logs
            </p>
          </div>

          <div className="divide-y divide-border">
            {workoutTask ? <AutoTrackedTaskRow task={workoutTask} onClick={openWorkout} /> : null}
            {sugarTask ? <AutoTrackedTaskRow task={sugarTask} onClick={openCalories} /> : null}
          </div>
        </section>

        {!progress.arcComplete && (
          <section className="overflow-hidden rounded-2xl border border-border bg-surface ring-1 ring-border">
            <div className="border-b border-border px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                Custom tasks
              </p>
              <p className="mt-1 text-sm text-muted">
                Repeat every day until your arc ends
              </p>
            </div>

            {dailyTasks.filter((task) => task.kind === 'custom').length === 0 ? (
              <p className="px-4 py-5 text-sm text-muted">No custom tasks yet. Add one below.</p>
            ) : (
              <ul className="divide-y divide-border">
                {dailyTasks
                  .filter((task) => task.kind === 'custom')
                  .map((task) => (
                    <li key={task.id} className="flex items-center gap-3 px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => toggleTask(task.id)}
                        className={[
                          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-1 transition',
                          task.completed
                            ? 'bg-emerald-500 text-white ring-emerald-500'
                            : 'bg-background ring-border hover:ring-foreground/30',
                        ].join(' ')}
                        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {task.completed ? <Check size={14} strokeWidth={3} /> : null}
                      </button>
                      <span
                        className={[
                          'min-w-0 flex-1 text-sm',
                          task.completed ? 'text-muted line-through' : 'font-medium',
                        ].join(' ')}
                      >
                        {task.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeTask(task.id)}
                        className="rounded-lg p-2 text-muted transition hover:bg-surface-elevated hover:text-red-500"
                        aria-label="Remove task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
              </ul>
            )}

            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={draftTask}
                  onChange={(event) => setDraftTask(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      handleAddTask()
                    }
                  }}
                  placeholder="Add a daily task…"
                  className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none ring-0 placeholder:text-muted focus:border-foreground/30"
                />
                <button
                  type="button"
                  onClick={handleAddTask}
                  disabled={!draftTask.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-border bg-surface px-4 py-4 ring-1 ring-border">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            This week
          </p>
          <p className="mt-1 text-sm font-semibold">
            {progress.workoutsThisWeek} / {progress.weeklyTarget} workouts
          </p>
          <p className="mt-1 text-xs text-muted">
            {progress.weeklyMet ? 'Weekly target met — keep the momentum.' : 'Stay on pace for your arc goal.'}
          </p>
        </section>
      </div>
    </div>
  )
}
