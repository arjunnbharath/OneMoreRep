import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getMonthBackground } from '../data/calendarMonthImages'
import type { WorkoutSession } from '../types/tracker'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function toDateKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
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

function buildMonthGrid(month: Date) {
  const first = startOfMonth(month)
  const startOffset = (first.getDay() + 6) % 7
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()

  const cells: Array<{ key: string; day: number; inMonth: boolean }> = []

  for (let i = 0; i < startOffset; i++) {
    const d = new Date(month.getFullYear(), month.getMonth(), -startOffset + i + 1)
    cells.push({ key: toDateKey(d), day: d.getDate(), inMonth: false })
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(month.getFullYear(), month.getMonth(), day)
    cells.push({ key: toDateKey(d), day, inMonth: true })
  }

  while (cells.length % 7 !== 0) {
    const last = parseDateKey(cells[cells.length - 1].key)
    const d = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1)
    cells.push({ key: toDateKey(d), day: d.getDate(), inMonth: false })
  }

  return cells
}

interface WorkoutCalendarProps {
  sessions: WorkoutSession[]
  onDaySelect?: (dateKey: string) => void
  variant?: 'default' | 'sidebar'
}

export default function WorkoutCalendar({
  sessions,
  onDaySelect,
  variant = 'default',
}: WorkoutCalendarProps) {
  const todayKey = toDateKey(new Date())
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()))
  const [selectedKey, setSelectedKey] = useState<string | null>(todayKey)

  const sessionsByDay = useMemo(() => {
    const map = new Map<string, WorkoutSession[]>()
    for (const session of sessions) {
      const dayKey = toDateKey(new Date(session.date))
      const list = map.get(dayKey) ?? []
      list.push(session)
      map.set(dayKey, list)
    }
    return map
  }, [sessions])

  const monthLabel = viewMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const monthBackground = getMonthBackground(viewMonth)
  const monthKey = `${viewMonth.getFullYear()}-${viewMonth.getMonth()}`

  const cells = useMemo(() => buildMonthGrid(viewMonth), [viewMonth])

  const selectedSessions = selectedKey ? sessionsByDay.get(selectedKey) ?? [] : []

  function handleSelect(key: string, inMonth: boolean) {
    if (!inMonth) {
      setViewMonth(startOfMonth(parseDateKey(key)))
    }
    setSelectedKey(key)
    onDaySelect?.(key)
  }

  const isSidebar = variant === 'sidebar'

  return (
    <section className="overflow-hidden rounded-2xl border border-border">
      <div className="relative min-h-[280px] overflow-hidden">
        <img
          key={monthKey}
          src={monthBackground.image}
          alt=""
          className="calendar-month-bg absolute inset-0 h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/80 via-black/55 to-black/85" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-black/30" />

        <div className={['relative', isSidebar ? 'p-4' : 'p-5'].join(' ')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
                Activity
              </p>
              <h2
                className={[
                  'mt-1 font-semibold tracking-tight text-white',
                  isSidebar ? 'text-base' : 'text-lg',
                ].join(' ')}
              >
                {monthLabel}
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMonth((m) => addMonths(m, -1))}
                aria-label="Previous month"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 ring-1 ring-white/15 transition hover:bg-white/10 hover:text-white"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMonth(startOfMonth(new Date()))
                  setSelectedKey(todayKey)
                }}
                className="px-2 text-xs font-medium text-white/55 transition hover:text-white"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setViewMonth((m) => addMonths(m, 1))}
                aria-label="Next month"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 ring-1 ring-white/15 transition hover:bg-white/10 hover:text-white"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className={['mt-4 grid grid-cols-7', isSidebar ? 'gap-0.5' : 'gap-1'].join(' ')}>
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="pb-2 text-center text-[10px] font-medium uppercase tracking-wide text-white/40"
              >
                {day}
              </div>
            ))}

            {cells.map(({ key, day, inMonth }) => {
              const hasWorkout = sessionsByDay.has(key)
              const isToday = key === todayKey
              const isSelected = key === selectedKey && !isToday

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelect(key, inMonth)}
                  className={[
                    'relative flex aspect-square flex-col items-center justify-center rounded-lg transition duration-200',
                    isSidebar ? 'text-xs' : 'text-sm',
                    !inMonth && !isToday ? 'text-white/20' : '',
                    inMonth && !isToday && !isSelected ? 'text-white/85 hover:bg-white/10' : '',
                    isToday
                      ? 'bg-red-500 font-semibold text-white shadow-[0_4px_14px_rgba(239,68,68,0.45)]'
                      : '',
                    isSelected ? 'bg-white font-medium text-black' : '',
                  ].join(' ')}
                >
                  <span className="font-medium tabular-nums">{day}</span>
                  {hasWorkout && (
                    <span
                      className={[
                        'mt-0.5 h-1 w-1 rounded-full',
                        isToday || isSelected ? 'bg-white' : 'bg-red-400',
                      ].join(' ')}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {!isSidebar && (
        <div className="border-t border-border bg-background p-5">
          {selectedKey && (
            <p className="text-xs text-muted">
              {parseDateKey(selectedKey).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}

          {selectedSessions.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {selectedSessions.map((session) => (
                <li
                  key={session.id}
                  className="flex items-center justify-between rounded-xl bg-surface px-3 py-2.5 text-sm"
                >
                  <span className="font-medium">{session.name}</span>
                  <span className="text-xs text-muted">
                    {session.exercises.length} exercise
                    {session.exercises.length === 1 ? '' : 's'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">No workouts logged on this day.</p>
          )}
        </div>
      )}
    </section>
  )
}
