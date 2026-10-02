import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { exerciseLogs, formatSetLine, trimNumber } from '../../../lib/statsInsights'
import { getLoggedExerciseNames } from '../../../lib/workoutProgress'
import type { WorkoutSession } from '../../../types/tracker'
import { StatsCard } from './StatsChrome'

interface ExerciseProgressCardProps {
  sessions: WorkoutSession[]
}

export default function ExerciseProgressCard({ sessions }: ExerciseProgressCardProps) {
  const names = useMemo(() => getLoggedExerciseNames(sessions), [sessions])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState('')
  const exercise = selected || names[0] || ''
  const logs = useMemo(
    () => (exercise ? exerciseLogs(sessions, exercise) : []),
    [sessions, exercise],
  )
  const chronological = useMemo(() => [...logs].reverse(), [logs])
  const best = chronological.reduce((top, log) => Math.max(top, log.bestWeight), 0)
  const chart = useMemo(() => buildBestWeightChart(chronological), [chronological])

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    const source = q ? names.filter((name) => name.toLowerCase().includes(q)) : names
    return source.slice(0, 8)
  }, [names, query])

  if (names.length === 0) return null

  return (
    <StatsCard>
      <div className="relative">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search an exercise"
          className="w-full rounded-xl bg-background py-2.5 pl-9 pr-9 text-sm outline-none ring-1 ring-border placeholder:text-muted focus:ring-foreground/30"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="scrollbar-hide mt-3 flex gap-2 overflow-x-auto pb-1">
        {matches.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setSelected(name)}
            className={[
              'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium',
              exercise === name ? 'bg-foreground text-background' : 'bg-foreground/10 text-foreground/80',
            ].join(' ')}
          >
            {name}
          </button>
        ))}
      </div>

      <h2 className="mt-4 truncate text-base font-semibold">{exercise}</h2>

      {chart ? (
        <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="mt-2 h-36 w-full">
          <defs>
            <linearGradient id="best-weight-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={chart.area} fill="url(#best-weight-fill)" />
          <path d={chart.line} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinejoin="round" />
          {chart.dots.map((dot) => (
            <circle key={dot.key} cx={dot.x} cy={dot.y} r={dot.r} fill="#60a5fa" />
          ))}
        </svg>
      ) : (
        <p className="mt-4 text-sm text-muted">No weighted sets yet</p>
      )}

      <ul className="mt-2 space-y-3">
        {logs.slice(0, 6).map((log) => (
          <li key={log.id} className="flex gap-3">
            <div className="w-14 shrink-0">
              <p className="text-xs font-medium text-foreground">
                {log.weekday} {log.day}
              </p>
              <p className="text-xs text-muted">{log.month}</p>
            </div>
            <p className="text-sm leading-snug text-foreground">
              {log.sets.map((set) => formatSetLine(set)).join(' ')}
            </p>
          </li>
        ))}
      </ul>

      {best > 0 && (
        <p className="mt-4 text-xs text-muted">
          Best set weight per workout · Best: {trimNumber(best)} kg
        </p>
      )}
      <p className="mt-1 text-[11px] leading-relaxed text-muted">
        A fuller dot means less left in the tank — the same weight at a lower RIR is progress the
        line alone does not show.
      </p>
    </StatsCard>
  )
}

function buildBestWeightChart(
  logs: { date: string; bestWeight: number; bestRir?: number }[],
) {
  const points = logs.filter((log) => log.bestWeight > 0)
  if (points.length === 0) return null
  const width = 320
  const height = 140
  const pad = { top: 16, right: 12, bottom: 12, left: 12 }
  const values = points.map((point) => point.bestWeight)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom
  const dots = points.map((point, index) => {
    const rir = point.bestRir
    const r = rir === undefined ? 3.5 : Math.max(2.4, 6.2 - rir * 0.9)
    return {
      key: point.date,
      r,
      x: pad.left + (points.length === 1 ? innerW / 2 : (index / (points.length - 1)) * innerW),
      y: pad.top + innerH - ((point.bestWeight - min) / span) * innerH,
    }
  })
  const line = dots.map((dot, index) => `${index === 0 ? 'M' : 'L'} ${dot.x} ${dot.y}`).join(' ')
  const area = `${line} L ${dots[dots.length - 1].x} ${pad.top + innerH} L ${dots[0].x} ${pad.top + innerH} Z`
  return { width, height, line, area, dots }
}
