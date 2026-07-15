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

    const padding = { top: 16, right: 12, bottom: 28, left: 36 }
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

    const prIndices = new Set<number>()
    let runningMax = 0
    coords.forEach((c, i) => {
      if (c.est1RM > runningMax) {
        runningMax = c.est1RM
        prIndices.add(i)
      }
    })

    return { width, coords, linePath, prIndices, minVal, maxVal, padding, innerH }
  }, [points, height])

  if (!chart) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl bg-surface ring-1 ring-border text-sm text-muted"
        style={{ height }}
      >
        Log this exercise to see progress
      </div>
    )
  }

  const { width, coords, linePath, prIndices, minVal, maxVal, padding, innerH } = chart

  return (
    <div className="rounded-2xl bg-surface p-4 ring-1 ring-border">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium text-muted">Est. 1RM (kg)</p>
        <p className="text-xs text-muted">
          {minVal.toFixed(0)} – {maxVal.toFixed(0)} kg
        </p>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label="Estimated one-rep max over time"
      >
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
                strokeOpacity={0.08}
              />
              <text
                x={padding.left - 6}
                y={y + 4}
                textAnchor="end"
                className="fill-muted text-[9px]"
              >
                {val.toFixed(0)}
              </text>
            </g>
          )
        })}

        <path
          d={linePath}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-foreground"
        />

        {coords.map((c, i) => (
          <g key={c.date}>
            <circle
              cx={c.x}
              cy={c.y}
              r={prIndices.has(i) ? 5 : 3.5}
              className={prIndices.has(i) ? 'fill-red-500' : 'fill-foreground'}
            />
            {prIndices.has(i) && (
              <text
                x={c.x}
                y={c.y - 10}
                textAnchor="middle"
                className="fill-red-500 text-[8px] font-bold"
              >
                PR
              </text>
            )}
            <text
              x={c.x}
              y={height - 6}
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
