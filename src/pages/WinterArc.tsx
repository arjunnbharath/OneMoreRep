import { ArrowLeft, CalendarDays, Check, ChevronRight, Plus, Snowflake, Trash2 } from 'lucide-react'
import WinterArcHistory from '../components/winter-arc/WinterArcHistory'
import WinterSnow from '../components/winter-arc/WinterSnow'
import FireEmoji from '../components/ui/FireEmoji'
import { useMemo, useState, type ReactNode } from 'react'
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
import { useWindowScrolled } from '../hooks/useWindowScrolled'
import type { WinterArcDailyTask } from '../types/winterArc'

function StatChip({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-0.5 text-center">
      <span className="text-base font-semibold tabular-nums leading-none text-white">{value}</span>
      <span className="truncate text-[10px] uppercase tracking-[0.12em] text-sky-100/50">{label}</span>
    </div>
  )
}

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
    <div className="flex min-h-14 items-center gap-3 px-4 py-2.5">
      <button
        type="button"
        onClick={onPress}
        disabled={isWorkout}
        className={isWorkout ? 'cursor-default' : undefined}
        aria-label={task.completed ? 'Done' : 'Mark done'}
      >
        <span
          className={[
            'flex h-7 w-7 items-center justify-center rounded-full transition',
            task.completed
              ? 'bg-gradient-to-br from-sky-300 to-blue-500 text-white shadow-[0_0_12px_rgba(56,189,248,0.45)]'
              : 'ring-2 ring-inset ring-sky-300/30',
          ].join(' ')}
        >
          {task.completed ? <Check size={15} strokeWidth={3} /> : null}
        </span>
      </button>

      <button type="button" onClick={onPress} className="min-w-0 flex-1 text-left">
        <p
          className={[
            'text-[15px]',
            task.completed && !isWorkout ? 'text-muted line-through' : 'text-foreground',
          ].join(' ')}
        >
          {task.label}
        </p>
        {isWorkout && (
          <p className="text-xs text-sky-500 dark:text-sky-300/80">
            {task.completed ? 'Trained today' : 'Tap to start today’s workout'}
          </p>
        )}
      </button>

      {isWorkout ? (
        <ChevronRight size={20} className="shrink-0 text-muted" />
      ) : onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:text-red-500 active:bg-foreground/10"
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
  const [showHistory, setShowHistory] = useState(false)
  const collapsed = useWindowScrolled(24)

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

  const title = progress.arcComplete ? 'Arc complete' : `Day ${progress.dayNumber}`
  const habitPercent = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="min-h-full bg-background pb-24 lg:pb-10">
      {/* Mobile top bar: sits on the night sky, turns into frosted ice once the page scrolls. */}
      <header
        className={[
          'fixed inset-x-0 top-0 z-30 flex items-center gap-3 px-5 pt-[var(--sat)] text-white transition-all duration-300 lg:hidden',
          collapsed
            ? 'h-[calc(var(--sat)+3.5rem)] bg-slate-950/75 shadow-[0_8px_24px_rgba(2,6,23,0.45)] backdrop-blur-xl'
            : 'h-[calc(var(--sat)+4.5rem)] bg-transparent',
        ].join(' ')}
      >
        <span
          className={[
            'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-300/30 to-blue-500/30 ring-1 ring-sky-200/30 transition-all duration-300',
            collapsed ? 'h-8 w-8' : 'h-10 w-10',
          ].join(' ')}
        >
          <Snowflake size={collapsed ? 16 : 20} className="text-sky-100" />
        </span>
        <div
          className={[
            'flex min-w-0 flex-1 transition-all duration-300',
            collapsed ? 'flex-row items-baseline gap-2' : 'flex-col-reverse',
          ].join(' ')}
        >
          <h1
            className={[
              'truncate font-semibold tracking-tight transition-all duration-300',
              collapsed ? 'text-base' : 'text-2xl',
            ].join(' ')}
          >
            {title}
          </h1>
          <p className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-200/70">
            {collapsed ? '· Winter Arc' : 'Winter Arc'}
          </p>
        </div>
        {progress.streak > 0 && (
          <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-white/10 px-2.5 py-1 text-sm font-semibold tabular-nums ring-1 ring-white/15">
            {progress.streak}
            <FireEmoji size={14} />
          </span>
        )}
      </header>

      <div className="relative overflow-hidden text-white">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_80%_0%,#1d4ed8_0%,#0f172a_55%,#020617_100%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-16 top-10 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl"
          aria-hidden
        />
        <WinterSnow />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent"
          aria-hidden
        />

        <div className="relative mx-auto max-w-2xl px-5 pb-6 pt-[calc(var(--sat)+5rem)] lg:px-8 lg:pt-8">
          <div className="mb-6 hidden items-center gap-3 lg:flex">
            <button
              type="button"
              onClick={() => navigate('/home')}
              aria-label="Back to home"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition hover:bg-white/15"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-200/70">
                Winter Arc
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-sky-100/60">
              <span>
                {progress.arcComplete
                  ? `${progress.totalWorkouts} workouts during your arc`
                  : `Day ${progress.dayNumber} of ${progress.totalDays} · ends ${formatWinterArcEndDate(progress.endDateKey)}`}
              </span>
              <span className="tabular-nums">{progress.progressPercent}%</span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-300 to-blue-500 transition-all duration-500"
                style={{ width: `${progress.progressPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center divide-x divide-white/10">
            <StatChip value={progress.daysRemaining} label="Days left" />
            <StatChip
              value={`${progress.workoutsThisWeek}/${progress.weeklyTarget}`}
              label="This week"
            />
            <StatChip value={progress.streak} label="Streak" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-3 py-2 lg:px-8 lg:py-5">
        {!progress.arcComplete && (
          <section className="overflow-hidden rounded-[1.5rem] bg-surface ring-1 ring-sky-400/15">
            <div className="px-4 pb-3 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-base font-medium">Daily habits</p>
                <p className="text-sm font-medium tabular-nums text-sky-600 dark:text-sky-300">
                  {completed}/{total}
                </p>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-sky-500/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-300 to-blue-500 transition-all duration-500"
                  style={{ width: `${habitPercent}%` }}
                />
              </div>
            </div>

            <ul>
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

            <div className="flex items-center gap-2 p-3">
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
                placeholder="Add a habit"
                className="h-12 min-w-0 flex-1 rounded-full bg-background px-5 text-[15px] outline-none ring-1 ring-sky-400/15 transition placeholder:text-muted focus:ring-sky-400/50"
              />
              <button
                type="button"
                onClick={handleAdd}
                disabled={!draft.trim()}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-[0_6px_18px_rgba(37,99,235,0.35)] transition active:scale-95 disabled:opacity-40 disabled:shadow-none"
                aria-label="Add habit"
              >
                <Plus size={20} />
              </button>
            </div>
          </section>
        )}

        <button
          type="button"
          onClick={() => setShowHistory(true)}
          className="mt-3 flex min-h-[4.5rem] w-full items-center gap-4 rounded-[1.5rem] bg-surface px-4 py-3 text-left ring-1 ring-sky-400/15 transition active:bg-foreground/[0.06]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-300">
            <CalendarDays size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-base leading-6">History</span>
            <span className="block text-sm leading-5 text-muted">Your 3 months, day by day</span>
          </span>
          <ChevronRight size={20} className="shrink-0 text-muted" />
        </button>
      </div>

      {showHistory && (
        <WinterArcHistory
          state={state}
          sessions={sessions}
          plan={plan}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  )
}
