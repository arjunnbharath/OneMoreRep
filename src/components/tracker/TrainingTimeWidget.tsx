import { useEffect, useMemo, useState } from 'react'
import { Clock, TrendingUp } from 'lucide-react'
import { getCurrentWeekKeys } from '../../lib/friendInsights'
import type { PeriodProgressPoint } from '../../lib/workoutProgress'
import { getSessionDurationSeconds } from '../../lib/workoutProgress'
import { toDateKey } from '../../pages/home/homeUtils'
import type { WorkoutSession } from '../../types/tracker'

type Range = 'week' | 'month'

interface TrainingTimeWidgetProps {
  sessions: WorkoutSession[]
  weekly: PeriodProgressPoint[]
  monthly: PeriodProgressPoint[]
}

function formatDuration(minutes: number) {
  if (minutes <= 0) return '0m'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

function useChartWidth() {
  const [width, setWidth] = useState(280)

  useEffect(() => {
    function update() {
      setWidth(window.innerWidth >= 1024 ? 360 : 280)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return width
}

export default function TrainingTimeWidget({
  sessions,
  weekly,
  monthly,
}: TrainingTimeWidgetProps) {
  const [range, setRange] = useState<Range>('week')
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)
  const chartWidth = useChartWidth()

  const weekKeys = useMemo(() => getCurrentWeekKeys(), [])

  const dailyWeekMinutes = useMemo(() => {
    return weekKeys.map((key) => {
      const minutes = sessions
        .filter((session) => toDateKey(new Date(session.date)) === key)
        .reduce((sum, session) => sum + Math.floor(getSessionDurationSeconds(session) / 60), 0)

      return {
        key,
        minutes,
        label: new Date(`${key}T12:00:00`).toLocaleDateString('en-US', { weekday: 'narrow' }),
        isToday: key === toDateKey(new Date()),
      }
    })
  }, [sessions, weekKeys])

  const periodPoints = range === 'week' ? weekly : monthly
  const currentPeriod = periodPoints[periodPoints.length - 1]
  const previousPeriod = periodPoints[periodPoints.length - 2]
  const periodMinutes = periodPoints.reduce((sum, point) => sum + point.minutes, 0)
  const periodSessions = periodPoints.reduce((sum, point) => sum + point.sessions, 0)
  const minuteDelta = (currentPeriod?.minutes ?? 0) - (previousPeriod?.minutes ?? 0)
  const avgPerSession =
    periodSessions > 0 ? Math.round(periodMinutes / periodSessions) : 0

  const weeklyGoal = useMemo(() => {
    const recentWeeks = weekly.slice(-5, -1)
    const avg =
      recentWeeks.length > 0
        ? recentWeeks.reduce((sum, point) => sum + point.minutes, 0) / recentWeeks.length
        : 120
    return Math.max(60, Math.round(avg))
  }, [weekly])

  const thisWeekMinutes = dailyWeekMinutes.reduce((sum, day) => sum + day.minutes, 0)
  const goalProgress = weeklyGoal > 0 ? Math.min(100, (thisWeekMinutes / weeklyGoal) * 100) : 0

  const chartPoints = range === 'week' ? dailyWeekMinutes : periodPoints.map((point) => ({
    key: point.key,
    minutes: point.minutes,
    label: point.label,
    isToday: point.key === currentPeriod?.key,
  }))

  const activeKey = hoveredKey ?? chartPoints[chartPoints.length - 1]?.key
  const activePoint = chartPoints.find((point) => point.key === activeKey) ?? chartPoints[chartPoints.length - 1]

  const chart = useMemo(() => {
    const height = 120
    const padding = { top: 16, right: 4, bottom: 24, left: 4 }
    const width = chartWidth
    const innerW = width - padding.left - padding.right
    const innerH = height - padding.top - padding.bottom
    const values = chartPoints.map((point) => point.minutes)
    const maxVal = Math.max(...values, range === 'week' ? 30 : 60, 1)
    const barGap = range === 'week' ? 6 : 8
    const barWidth = Math.max(
      8,
      (innerW - barGap * (chartPoints.length - 1)) / Math.max(chartPoints.length, 1),
    )

    const bars = chartPoints.map((point, i) => {
      const value = point.minutes
      const barH = value > 0 ? (value / maxVal) * innerH : 0
      const x = padding.left + i * (barWidth + barGap)
      const y = padding.top + innerH - barH
      return { point, value, x, y, barH, barWidth }
    })

    return { width, height, bars, padding, innerH }
  }, [chartPoints, chartWidth, range])

  const ringRadius = 42
  const ringCircumference = 2 * Math.PI * ringRadius
  const ringOffset = ringCircumference - (goalProgress / 100) * ringCircumference

  return (
    <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-4 py-4 lg:px-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 ring-1 ring-sky-500/20 dark:text-sky-400">
            <Clock size={18} />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              Training time
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {formatDuration(activePoint?.minutes ?? (range === 'week' ? thisWeekMinutes : periodMinutes))}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {range === 'week'
                ? activePoint?.label
                  ? `${activePoint.label} · this week`
                  : 'This week'
                : `${periodMinutes > 0 ? formatDuration(periodMinutes) : '0m'} total`}
            </p>
          </div>
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

      <div className="grid gap-4 p-4 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center lg:px-5 lg:pb-5">
        {range === 'week' && (
          <div className="flex items-center justify-center">
            <div className="relative h-[104px] w-[104px]">
              <svg viewBox="0 0 104 104" className="h-full w-full -rotate-90">
                <circle
                  cx="52"
                  cy="52"
                  r={ringRadius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-background"
                />
                <circle
                  cx="52"
                  cy="52"
                  r={ringRadius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  className="text-sky-500 transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-lg font-semibold tabular-nums leading-none">
                  {Math.round(goalProgress)}%
                </p>
                <p className="mt-1 text-[9px] font-medium uppercase tracking-wide text-muted">
                  of goal
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="min-w-0">
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                label: range === 'week' ? 'This week' : 'Total',
                value: formatDuration(range === 'week' ? thisWeekMinutes : periodMinutes),
              },
              {
                label: 'Avg / session',
                value: avgPerSession > 0 ? formatDuration(avgPerSession) : '—',
              },
              {
                label: 'Weekly goal',
                value: formatDuration(weeklyGoal),
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl bg-background px-3 py-2.5 ring-1 ring-border/60"
              >
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted">
                  {label}
                </p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums">{value}</p>
              </div>
            ))}
          </div>

          {minuteDelta !== 0 && range === 'week' && (
            <p
              className={[
                'mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1',
                minuteDelta > 0
                  ? 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400'
                  : 'bg-red-500/10 text-red-600 ring-red-500/20 dark:text-red-400',
              ].join(' ')}
            >
              <TrendingUp size={11} className={minuteDelta < 0 ? 'rotate-180' : ''} />
              {minuteDelta > 0 ? '+' : ''}
              {formatDuration(Math.abs(minuteDelta))} vs last {range}
            </p>
          )}

          <div className="mt-4">
            <svg
              viewBox={`0 0 ${chart.width} ${chart.height}`}
              className="w-full"
              role="img"
              aria-label={`${range === 'week' ? 'Daily' : 'Monthly'} training time`}
              onMouseLeave={() => setHoveredKey(null)}
            >
              <defs>
                <linearGradient id="timeBarActive" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="currentColor" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="currentColor" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="timeBarDefault" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="currentColor" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="currentColor" stopOpacity={0.55} />
                </linearGradient>
              </defs>

              {chart.bars.map(({ point, value, x, y, barH, barWidth }) => {
                const isActive = point.key === activeKey
                return (
                  <g
                    key={point.key}
                    onMouseEnter={() => setHoveredKey(point.key)}
                    className="cursor-pointer"
                  >
                    <rect
                      x={x}
                      y={chart.padding.top}
                      width={barWidth}
                      height={chart.innerH}
                      rx={6}
                      className="fill-foreground"
                      opacity={0.05}
                    />
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={Math.max(barH, value > 0 ? 6 : 0)}
                      rx={6}
                      fill={isActive ? 'url(#timeBarActive)' : 'url(#timeBarDefault)'}
                      className="text-sky-500 transition-opacity"
                      opacity={hoveredKey && !isActive ? 0.45 : 1}
                    />
                    {value > 0 && isActive && (
                      <text
                        x={x + barWidth / 2}
                        y={y - 6}
                        textAnchor="middle"
                        className="fill-foreground text-[8px] font-semibold"
                      >
                        {formatDuration(value)}
                      </text>
                    )}
                    <text
                      x={x + barWidth / 2}
                      y={chart.height - 6}
                      textAnchor="middle"
                      className={[
                        'text-[8px]',
                        isActive ? 'fill-foreground font-semibold' : 'fill-muted',
                        'isToday' in point && point.isToday && !isActive ? 'fill-sky-500' : '',
                      ].join(' ')}
                    >
                      {point.label}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
