import { useMemo, useState } from 'react'
import type { PeriodProgressPoint } from '../../lib/workoutProgress'

type Range = 'week' | 'month'

interface ProgressVolumeChartProps {
  weekly: PeriodProgressPoint[]
  monthly: PeriodProgressPoint[]
}

function formatVolume(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
  return value.toLocaleString()
}

export default function ProgressVolumeChart({ weekly, monthly }: ProgressVolumeChartProps) {
  const [range, setRange] = useState<Range>('week')
  const points = range === 'week' ? weekly : monthly
  const currentKey = points[points.length - 1]?.key

  const totals = useMemo(
    () => ({
      volume: points.reduce((sum, p) => sum + p.volume, 0),
      sessions: points.reduce((sum, p) => sum + p.sessions, 0),
      minutes: points.reduce((sum, p) => sum + p.minutes, 0),
    }),
    [points],
  )

  const chart = useMemo(() => {
    const height = 200
    const padding = { top: 20, right: 4, bottom: 28, left: 4 }
    const width = 320
    const innerW = width - padding.left - padding.right
    const innerH = height - padding.top - padding.bottom
    const values = points.map((p) => p.volume)
    const maxVal = Math.max(...values, 1)
    const barGap = range === 'week' ? 5 : 8
    const barWidth = Math.max(
      10,
      (innerW - barGap * (points.length - 1)) / Math.max(points.length, 1),
    )

    const bars = points.map((point, i) => {
      const value = point.volume
      const barH = value > 0 ? (value / maxVal) * innerH : 0
      const x = padding.left + i * (barWidth + barGap)
      const y = padding.top + innerH - barH
      return { point, value, x, y, barH, barWidth, isCurrent: point.key === currentKey }
    })

    return { width, height, bars, padding, innerH }
  }, [points, range, currentKey])

  const hasData = totals.volume > 0 || totals.sessions > 0
  const avgVolume = points.length > 0 ? Math.round(totals.volume / points.length) : 0

  return (
    <div className="rounded-2xl bg-surface ring-1 ring-border">
      <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            Training volume
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {formatVolume(totals.volume)}
            <span className="ml-1 text-sm font-medium text-muted">kg</span>
          </p>
        </div>

        <div className="flex rounded-xl bg-background p-1 ring-1 ring-border">
          {(['week', 'month'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRange(option)}
              className={[
                'rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition',
                range === option
                  ? 'bg-foreground text-background'
                  : 'text-muted hover:text-foreground',
              ].join(' ')}
            >
              {option === 'week' ? 'Week' : 'Month'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 py-3">
        {[
          { label: 'Sessions', value: String(totals.sessions) },
          { label: 'Minutes', value: String(totals.minutes) },
          { label: range === 'week' ? 'Avg / week' : 'Avg / month', value: formatVolume(avgVolume) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl bg-background px-3 py-2.5">
            <p className="text-[10px] text-muted">{label}</p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <div className="px-2 pb-4 pt-1">
        {!hasData ? (
          <div className="mx-2 flex h-[200px] items-center justify-center rounded-xl bg-background text-sm text-muted">
            Log workouts to see your volume trend
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${chart.width} ${chart.height}`}
            className="w-full"
            role="img"
            aria-label={`${range === 'week' ? 'Weekly' : 'Monthly'} training volume`}
          >
            {chart.bars.map(({ point, value, x, y, barH, barWidth, isCurrent }) => (
              <g key={point.key}>
                <rect
                  x={x}
                  y={chart.padding.top}
                  width={barWidth}
                  height={chart.innerH}
                  rx={6}
                  className="fill-foreground"
                  opacity={0.06}
                />
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barH, value > 0 ? 6 : 0)}
                  rx={6}
                  className={isCurrent ? 'fill-foreground' : 'fill-foreground/70'}
                />
                {value > 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 8}
                    textAnchor="middle"
                    className="fill-foreground text-[8px] font-medium"
                  >
                    {formatVolume(value)}
                  </text>
                )}
                <text
                  x={x + barWidth / 2}
                  y={chart.height - 6}
                  textAnchor="middle"
                  className={[
                    'text-[8px]',
                    isCurrent ? 'fill-foreground font-semibold' : 'fill-muted',
                  ].join(' ')}
                >
                  {point.label}
                </text>
              </g>
            ))}
          </svg>
        )}
      </div>
    </div>
  )
}
