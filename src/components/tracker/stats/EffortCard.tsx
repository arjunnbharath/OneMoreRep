import { useMemo, useState } from 'react'
import { effortSummary, type EffortRange } from '../../../lib/statsInsights'
import type { WorkoutSession } from '../../../types/tracker'
import { StatsCard, StatsPills } from './StatsChrome'

const RANGES: { id: EffortRange; label: string }[] = [
  { id: '30d', label: '30d' },
  { id: '90d', label: '90d' },
  { id: '1y', label: '1Y' },
  { id: 'all', label: 'All' },
]

interface EffortCardProps {
  sessions: WorkoutSession[]
}

export default function EffortCard({ sessions }: EffortCardProps) {
  const [range, setRange] = useState<EffortRange>('90d')
  const summary = useMemo(() => effortSummary(sessions, range), [sessions, range])
  const ratedPoints = summary.weekly.filter((point) => point.average !== null)
  const chart = useMemo(() => buildChart(summary.weekly), [summary.weekly])

  return (
    <StatsCard>
      <StatsPills value={range} options={RANGES} onChange={setRange} ariaLabel="Effort period" />

      {summary.rated === 0 ? (
        <div className="mt-5">
          <p className="text-sm font-medium">Effort shows up once you rate sets</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Add RIR (reps left in the tank) on a finished set. A 0 means you could not have done
            another rep. A 3 means three reps were still there.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-3xl font-medium tracking-tight">
                {summary.averageRir?.toFixed(1)}{' '}
                <span className="text-lg font-medium text-muted">RIR</span>
              </p>
              <p className="text-xs text-muted">average effort</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-medium tracking-tight">
                {summary.hardPercent}%
              </p>
              <p className="text-xs text-muted">at RIR 3 or harder</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted">
            {summary.rated} of {summary.finished} finished sets rated
          </p>

          {chart && ratedPoints.length > 1 && (
            <div className="mt-5">
              <p className="text-sm font-medium">Week by week</p>
              <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="mt-2 h-28 w-full">
                <defs>
                  <linearGradient id="rir-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#facc15" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={chart.area} fill="url(#rir-fill)" />
                <path d={chart.line} fill="none" stroke="#facc15" strokeWidth="2.5" strokeLinejoin="round" />
                {chart.dots.map((dot) => (
                  <circle key={dot.key} cx={dot.x} cy={dot.y} r="3.5" fill="#facc15" />
                ))}
              </svg>
            </div>
          )}

          <div className="mt-5">
            <p className="text-sm font-medium">Where the sets land</p>
            <ul className="mt-3 space-y-2.5">
              {summary.buckets.map((bucket) => (
                <li key={bucket.label} className="grid grid-cols-[64px_1fr_auto] items-center gap-3">
                  <span className="text-xs text-muted">{bucket.label}</span>
                  <span className="h-2 overflow-hidden rounded-full bg-foreground/10">
                    <span
                      className="block h-full rounded-full bg-amber-300"
                      style={{ width: `${bucket.percent}%` }}
                    />
                  </span>
                  <span className="text-xs tabular-nums text-muted">
                    {bucket.count} · {bucket.percent}%
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              Most working sets belong close to failure without living there — a mix of hard and
              moderate sets is a healthy middle.
            </p>
          </div>
        </>
      )}
    </StatsCard>
  )
}

function buildChart(weekly: { label: string; average: number | null }[]) {
  const points = weekly
    .map((point, index) => ({ ...point, index }))
    .filter((point) => point.average !== null)
  if (points.length < 2) return null

  const width = 320
  const height = 110
  const pad = { top: 12, right: 8, bottom: 8, left: 8 }
  const values = points.map((point) => point.average as number)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom

  const dots = points.map((point) => {
    const x = pad.left + (point.index / (weekly.length - 1)) * innerW
    const y = pad.top + (((point.average as number) - min) / span) * innerH
    return { key: point.index, x, y }
  })
  const line = dots.map((dot, index) => `${index === 0 ? 'M' : 'L'} ${dot.x} ${dot.y}`).join(' ')
  const area = `${line} L ${dots[dots.length - 1].x} ${pad.top + innerH} L ${dots[0].x} ${pad.top + innerH} Z`
  return { width, height, line, area, dots }
}
