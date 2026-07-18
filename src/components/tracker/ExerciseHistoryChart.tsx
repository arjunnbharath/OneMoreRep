import { useMemo } from 'react'
import type { ExerciseHistoryPoint } from '../../lib/workoutProgress'

interface ExerciseHistoryChartProps {
  points: ExerciseHistoryPoint[]
  height?: number
}

export default function ExerciseHistoryChart({
  points,
  height = 200,
}: ExerciseHistoryChartProps) {
  const chart = useMemo(() => {
    if (points.length === 0) return null

    const padding = { top: 20, right: 12, bottom: 32, left: 40 }
    const width = 320
    const innerW = width - padding.left - padding.right
    const innerH = height - padding.top - padding.bottom

    const values = points.map((p) => p.est1RM)
    const minVal = Math.min(...values)
    const maxVal = Math.max(...values)
    const range = maxVal - minVal || 1

    const coords = points.map((p, i) => {
      const x =
        padding.left +
        (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW)
      const y = padding.top + innerH - ((p.est1RM - minVal) / range) * innerH
      return { ...p, x, y }
    })

    const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ')
    const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${padding.top + innerH} L ${coords[0].x} ${padding.top + innerH} Z`

    const prIndices = new Set<number>()
    let runningMax = 0
    coords.forEach((c, i) => {
      if (c.est1RM > runningMax) {
        runningMax = c.est1RM
        prIndices.add(i)
      }
    })

    return { width, coords, linePath, areaPath, prIndices, minVal, maxVal, padding, innerH }
  }, [points, height])

  if (!chart) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-2xl bg-background py-12 text-center ring-1 ring-border/60"
        style={{ minHeight: height }}
      >
        <p className="text-sm font-medium text-muted">No data yet</p>
        <p className="mt-1 text-xs text-muted">Complete sets to track progress</p>
      </div>
    )
  }

  const { width, coords, linePath, areaPath, prIndices, minVal, maxVal, padding, innerH } = chart
  const latest = coords[coords.length - 1]

  return (
    <div className="rounded-2xl bg-background p-3 ring-1 ring-border/60">
      <div className="mb-3 flex items-end justify-between gap-3 px-1">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted">
            Est. 1RM
          </p>
          <p className="mt-0.5 text-xl font-semibold tabular-nums">
            {latest.est1RM.toFixed(1)}
            <span className="ml-1 text-sm font-medium text-muted">kg</span>
          </p>
        </div>
        <p className="text-xs text-muted">
          Range {minVal.toFixed(0)}–{maxVal.toFixed(0)} kg
        </p>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label="Estimated one-rep max over time"
      >
        <defs>
          <linearGradient id="exerciseAreaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity={0.12} />
            <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
          </linearGradient>
        </defs>

        {[0, 0.5, 1].map((frac) => {
          const y = padding.top + innerH * (1 - frac)
          const val = minVal + (maxVal - minVal) * frac
          return (
            <g key={frac}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="currentColor"
                strokeOpacity={0.06}
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-muted text-[9px]"
              >
                {val.toFixed(0)}
              </text>
            </g>
          )
        })}

        <path d={areaPath} fill="url(#exerciseAreaFill)" className="text-foreground" />

        <path
          d={linePath}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-foreground"
        />

        {coords.map((c, i) => (
          <g key={c.date}>
            {prIndices.has(i) && (
              <circle cx={c.x} cy={c.y} r={8} className="fill-red-500/15" />
            )}
            <circle
              cx={c.x}
              cy={c.y}
              r={prIndices.has(i) ? 4.5 : 3.5}
              className={prIndices.has(i) ? 'fill-red-500' : 'fill-foreground'}
            />
            {prIndices.has(i) && (
              <text
                x={c.x}
                y={c.y - 12}
                textAnchor="middle"
                className="fill-red-500 text-[8px] font-bold"
              >
                PR
              </text>
            )}
            <text
              x={c.x}
              y={height - 8}
              textAnchor="middle"
              className="fill-muted text-[8px]"
            >
              {c.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
