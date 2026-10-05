import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Dumbbell, X } from 'lucide-react'
import { getDailyTasks, summarizeDailyTasks, WINTER_ARC_DURATION_DAYS } from '../../lib/winterArc'
import { toDateKey } from '../../pages/home/homeUtils'
import type { WorkoutSession } from '../../types/tracker'
import type { WeeklyPlan } from '../../types/workoutPlan'
import type { WinterArcDailyTask, WinterArcState } from '../../types/winterArc'
import WinterSnow from './WinterSnow'

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

type DayStatus = 'future' | 'none' | 'partial' | 'full'

interface ArcDay {
  key: string
  date: Date
  dayNumber: number
  status: DayStatus
  completed: number
  total: number
  tasks: WinterArcDailyTask[]
  sessions: WorkoutSession[]
}

function parseDateKey(key: string) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date: Date, count: number) {
  return new Date(date.getFullYear(), date.getMonth() + count, 1)
}

function buildArcDays(state: WinterArcState, sessions: WorkoutSession[], plan: WeeklyPlan): ArcDay[] {
  if (!state.enrolledAt) return []
  const start = parseDateKey(state.enrolledAt)
  const todayKey = toDateKey(new Date())

  const sessionsByDay = new Map<string, WorkoutSession[]>()
  for (const session of sessions) {
    const key = toDateKey(new Date(session.date))
    sessionsByDay.set(key, [...(sessionsByDay.get(key) ?? []), session])
  }

  return Array.from({ length: WINTER_ARC_DURATION_DAYS }, (_, index): ArcDay => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    const key = toDateKey(date)
    const base = { key, date, dayNumber: index + 1, sessions: sessionsByDay.get(key) ?? [] }
    if (key > todayKey) {
      return { ...base, status: 'future', completed: 0, total: 0, tasks: [] }
    }
    const tasks = getDailyTasks(state, sessions, plan, key).map((task) =>
      task.kind === 'workout' ? { ...task, label: task.completed ? 'Workout done' : 'Workout' } : task,
    )
    const { completed, total } = summarizeDailyTasks(tasks)
    const status: DayStatus = completed === 0 ? 'none' : completed >= total ? 'full' : 'partial'
    return { ...base, status, completed, total, tasks }
  })
}

function buildMonthCells(month: Date, byKey: Map<string, ArcDay>) {
  const leading = (month.getDay() + 6) % 7
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells: ({ key: string; day: number; arcDay?: ArcDay } | null)[] = Array(leading).fill(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const key = toDateKey(new Date(month.getFullYear(), month.getMonth(), d))
    cells.push({ key, day: d, arcDay: byKey.get(key) })
  }
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function buildWeeks(days: ArcDay[]) {
  const weeks: { label: string; percent: number | null; workouts: number; isCurrent: boolean }[] = []
  const todayKey = toDateKey(new Date())
  for (let i = 0; i < days.length; i += 7) {
    const chunk = days.slice(i, i + 7)
    const elapsed = chunk.filter((day) => day.status !== 'future')
    const total = elapsed.reduce((sum, day) => sum + day.total, 0)
    const completed = elapsed.reduce((sum, day) => sum + day.completed, 0)
    weeks.push({
      label: `W${i / 7 + 1}`,
      percent: elapsed.length === 0 ? null : total === 0 ? 0 : Math.round((completed / total) * 100),
      workouts: elapsed.filter((day) => day.sessions.length > 0).length,
      isCurrent: chunk.some((day) => day.key === todayKey),
    })
  }
  return weeks
}

function cellClass(status: DayStatus) {
  switch (status) {
    case 'full':
      return 'bg-gradient-to-br from-sky-300 to-blue-500 font-semibold text-white shadow-[0_0_12px_rgba(56,189,248,0.45)]'
    case 'partial':
      return 'bg-sky-400/25 text-white'
    case 'none':
      return 'bg-white/[0.06] text-white/70'
    default:
      return 'text-white/30'
  }
}

function describeExercise(sets: WorkoutSession['exercises'][number]['sets']) {
  const working = sets.filter((set) => !set.isWarmup)
  const list = working.length > 0 ? working : sets
  const best = list.reduce<(typeof list)[number] | null>((top, set) => {
    if (!top) return set
    const score = (set.weight ?? 0) * 1000 + set.reps
    const topScore = (top.weight ?? 0) * 1000 + top.reps
    return score > topScore ? set : top
  }, null)
  const count = `${list.length} set${list.length === 1 ? '' : 's'}`
  if (!best) return count
  return best.weight ? `${count} · best ${best.weight} × ${best.reps}` : `${count} · best ${best.reps} reps`
}

function WeeklyChart({ weeks }: { weeks: ReturnType<typeof buildWeeks> }) {
  const elapsed = weeks.filter((week) => week.percent !== null)
  const average =
    elapsed.length === 0 ? 0 : Math.round(elapsed.reduce((sum, week) => sum + (week.percent ?? 0), 0) / elapsed.length)

  return (
    <section className="rounded-[1.5rem] bg-surface p-4">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-sm font-medium">Weekly progress</p>
          <p className="text-xs text-muted">Habits completed each week</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold leading-none tabular-nums text-sky-600 dark:text-sky-300">{average}%</p>
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted">Average</p>
        </div>
      </div>

      <div className="relative h-32">
        {[0, 50, 100].map((line) => (
          <div
            key={line}
            className="pointer-events-none absolute inset-x-0 border-t border-dashed border-foreground/[0.08]"
            style={{ bottom: `${line}%` }}
          />
        ))}
        <div className="relative flex h-full items-end gap-1.5">
          {weeks.map((week) => (
            <div key={week.label} className="flex h-full flex-1 flex-col items-center justify-end">
              {week.percent !== null && (
                <span
                  className={[
                    'mb-1 text-[9px] font-medium tabular-nums',
                    week.isCurrent ? 'text-sky-600 dark:text-sky-300' : 'text-muted',
                  ].join(' ')}
                >
                  {week.percent}
                </span>
              )}
              <div
                className={[
                  'w-full rounded-md transition-all duration-500',
                  week.percent === null
                    ? 'h-1 bg-foreground/[0.06]'
                    : week.isCurrent
                      ? 'bg-gradient-to-t from-blue-500 to-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.4)]'
                      : 'bg-gradient-to-t from-blue-500/70 to-sky-300/70',
                ].join(' ')}
                style={week.percent === null ? undefined : { height: `${Math.max(week.percent, 3)}%` }}
                title={`${week.label}: ${week.percent ?? 0}% · ${week.workouts} workout days`}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex gap-1.5">
        {weeks.map((week) => (
          <span
            key={week.label}
            className={[
              'flex-1 text-center text-[9px] tabular-nums',
              week.isCurrent ? 'font-semibold text-sky-600 dark:text-sky-300' : 'text-muted',
            ].join(' ')}
          >
            {week.label}
          </span>
        ))}
      </div>
    </section>
  )
}

export default function WinterArcHistory({
  state,
  sessions,
  plan,
  onClose,
}: {
  state: WinterArcState
  sessions: WorkoutSession[]
  plan: WeeklyPlan
  onClose: () => void
}) {
  const days = useMemo(() => buildArcDays(state, sessions, plan), [state, sessions, plan])
  const byKey = useMemo(() => new Map(days.map((day) => [day.key, day])), [days])
  const weeks = useMemo(() => buildWeeks(days), [days])
  const todayKey = toDateKey(new Date())

  const firstMonth = days.length > 0 ? startOfMonth(days[0].date) : startOfMonth(new Date())
  const lastMonth = days.length > 0 ? startOfMonth(days[days.length - 1].date) : firstMonth

  const [viewMonth, setViewMonth] = useState(() => {
    const current = startOfMonth(new Date())
    if (current < firstMonth) return firstMonth
    if (current > lastMonth) return lastMonth
    return current
  })
  const [selectedKey, setSelectedKey] = useState<string | null>(() => (byKey.has(todayKey) ? todayKey : days[0]?.key ?? null))

  const cells = useMemo(() => buildMonthCells(viewMonth, byKey), [viewMonth, byKey])
  const canPrev = viewMonth > firstMonth
  const canNext = viewMonth < lastMonth

  const elapsed = days.filter((day) => day.status !== 'future')
  const fullDays = elapsed.filter((day) => day.status === 'full').length
  const activeDays = elapsed.filter((day) => day.status !== 'none').length
  const workoutDays = elapsed.filter((day) => day.sessions.length > 0).length
  const selected = selectedKey ? byKey.get(selectedKey) ?? null : null

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  function goToToday() {
    const current = startOfMonth(new Date())
    if (current >= firstMonth && current <= lastMonth) setViewMonth(current)
    if (byKey.has(todayKey)) setSelectedKey(todayKey)
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-background text-foreground">
      <header className="flex h-[calc(var(--sat)+3.75rem)] shrink-0 items-center gap-1 px-2 pt-[var(--sat)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Back"
          className="flex h-12 w-12 items-center justify-center rounded-full transition active:bg-foreground/10"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-600 dark:text-sky-300/80">
            Winter Arc
          </p>
          <h1 className="text-[1.375rem] leading-tight tracking-tight">History</h1>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-[max(2rem,var(--sab))]">
        <div className="mx-auto max-w-lg space-y-3">
          <div className="flex items-center divide-x divide-border rounded-[1.5rem] bg-surface py-4">
            {[
              { value: fullDays, label: 'Perfect days' },
              { value: activeDays, label: 'Active days' },
              { value: workoutDays, label: 'Workouts' },
            ].map((item) => (
              <div key={item.label} className="flex flex-1 flex-col items-center gap-0.5">
                <span className="text-lg font-semibold tabular-nums leading-none">{item.value}</span>
                <span className="text-[10px] uppercase tracking-[0.12em] text-muted">{item.label}</span>
              </div>
            ))}
          </div>

          <section className="relative overflow-hidden rounded-[1.5rem] bg-[radial-gradient(120%_90%_at_85%_0%,#1d4ed8_0%,#0f172a_60%,#020617_100%)] p-4 text-white ring-1 ring-white/10">
            <WinterSnow />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">Activity</p>
                  <h2 className="mt-0.5 text-lg font-semibold tracking-tight">
                    {viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                </div>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    disabled={!canPrev}
                    onClick={() => setViewMonth((m) => addMonths(m, -1))}
                    aria-label="Previous month"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 ring-1 ring-white/15 transition hover:bg-white/10 disabled:opacity-30"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={goToToday}
                    className="px-2 text-xs font-medium text-white/55 transition hover:text-white"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    disabled={!canNext}
                    onClick={() => setViewMonth((m) => addMonths(m, 1))}
                    aria-label="Next month"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 ring-1 ring-white/15 transition hover:bg-white/10 disabled:opacity-30"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-7 gap-1.5 text-center">
                {WEEKDAYS.map((initial, index) => (
                  <span key={index} className="pb-1 text-[10px] font-medium uppercase text-white/40">
                    {initial}
                  </span>
                ))}
                {cells.map((cell, index) => {
                  if (!cell) return <span key={`blank-${index}`} />
                  const { arcDay } = cell
                  if (!arcDay) {
                    return (
                      <span key={cell.key} className="flex aspect-square items-center justify-center text-xs text-white/20">
                        {cell.day}
                      </span>
                    )
                  }
                  const isSelected = cell.key === selectedKey
                  const isToday = cell.key === todayKey
                  return (
                    <button
                      key={cell.key}
                      type="button"
                      disabled={arcDay.status === 'future'}
                      onClick={() => setSelectedKey(cell.key)}
                      aria-label={`Day ${arcDay.dayNumber}, ${arcDay.completed} of ${arcDay.total} done`}
                      className={[
                        'relative flex aspect-square items-center justify-center rounded-xl text-xs tabular-nums transition active:scale-95',
                        cellClass(arcDay.status),
                        isSelected ? 'ring-2 ring-white' : isToday ? 'ring-1 ring-sky-300' : '',
                      ].join(' ')}
                    >
                      {cell.day}
                      {arcDay.sessions.length > 0 && arcDay.status !== 'full' && (
                        <span className="absolute bottom-1 h-1 w-1 rounded-full bg-sky-300" />
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-white/55">
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-white/[0.08]" /> Missed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-sky-400/30" /> Partial
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded bg-gradient-to-br from-sky-300 to-blue-500" /> All done
                </span>
              </div>
            </div>
          </section>

          {selected && (
            <section className="rounded-[1.5rem] bg-surface">
              <div className="flex items-center justify-between px-4 pb-2 pt-4">
                <div>
                  <p className="text-base font-medium">
                    {selected.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-sm text-muted">
                    Day {selected.dayNumber} of {WINTER_ARC_DURATION_DAYS}
                  </p>
                </div>
                <span className="rounded-full bg-sky-500/10 px-3 py-1 text-sm font-medium tabular-nums text-sky-600 dark:text-sky-300">
                  {selected.completed}/{selected.total}
                </span>
              </div>

              <p className="px-4 pt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Habits</p>
              <ul className="pb-1">
                {selected.tasks.map((task) => (
                  <li key={task.id} className="flex min-h-11 items-center gap-3 px-4 py-1.5">
                    <span
                      className={[
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                        task.completed
                          ? 'bg-gradient-to-br from-sky-300 to-blue-500 text-white'
                          : 'bg-foreground/[0.06] text-muted',
                      ].join(' ')}
                    >
                      {task.completed ? <Check size={13} strokeWidth={3} /> : <X size={12} />}
                    </span>
                    <span className={task.completed ? 'text-[15px]' : 'text-[15px] text-muted'}>{task.label}</span>
                  </li>
                ))}
              </ul>

              <p className="border-t border-border px-4 pt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                Workouts
              </p>
              {selected.sessions.length > 0 ? (
                <ul className="space-y-2 p-3 pt-2">
                  {selected.sessions.map((session) => (
                    <li key={session.id} className="rounded-2xl bg-foreground/[0.04] p-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-300">
                          <Dumbbell size={15} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-medium">{session.name}</p>
                          <p className="text-xs text-muted">
                            {session.exercises.length} exercise{session.exercises.length === 1 ? '' : 's'}
                          </p>
                        </div>
                      </div>
                      {session.exercises.length > 0 && (
                        <ul className="mt-2 space-y-1 pl-[2.6rem]">
                          {session.exercises.map((exercise) => (
                            <li key={exercise.id} className="flex items-baseline justify-between gap-3 text-sm">
                              <span className="truncate">{exercise.name}</span>
                              <span className="shrink-0 text-xs tabular-nums text-muted">
                                {describeExercise(exercise.sets)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-4 pb-4 pt-1 text-sm text-muted">No workouts logged on this day.</p>
              )}
            </section>
          )}

          <WeeklyChart weeks={weeks} />
        </div>
      </div>
    </div>
  )
}
