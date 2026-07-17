import { useMemo } from 'react'
import { Crown, Flame } from 'lucide-react'
import { getLast7DaySessionSeries } from '../../lib/friendInsights'
import type { WorkoutSession } from '../../types/tracker'

interface FriendRivalryChartProps {
  mySessions: WorkoutSession[]
  friendSessions: WorkoutSession[]
  myLabel: string
  friendLabel: string
  myStreak: number
  friendStreak: number
}

export default function FriendRivalryChart({
  mySessions,
  friendSessions,
  myLabel,
  friendLabel,
  myStreak,
  friendStreak,
}: FriendRivalryChartProps) {
  const mySeries = useMemo(() => getLast7DaySessionSeries(mySessions), [mySessions])
  const friendSeries = useMemo(() => getLast7DaySessionSeries(friendSessions), [friendSessions])

  const myTotal = mySeries.reduce((sum, day) => sum + day.count, 0)
  const friendTotal = friendSeries.reduce((sum, day) => sum + day.count, 0)

  const streakLeader =
    myStreak > friendStreak ? 'you' : friendStreak > myStreak ? 'friend' : 'tie'
  const sessionLeader =
    myTotal > friendTotal ? 'you' : friendTotal > myTotal ? 'friend' : 'tie'

  const chart = useMemo(() => {
    const width = 280
    const height = 64
    const padX = 6
    const padY = 6
    const innerW = width - padX * 2
    const innerH = height - padY * 2
    const maxY = Math.max(...mySeries.map((d) => d.count), ...friendSeries.map((d) => d.count), 1)
    const step = innerW / Math.max(mySeries.length - 1, 1)

    function toPoints(series: typeof mySeries) {
      return series.map((day, i) => ({
        x: padX + i * step,
        y: padY + innerH - (day.count / maxY) * innerH,
        count: day.count,
      }))
    }

    const myPoints = toPoints(mySeries)
    const friendPoints = toPoints(friendSeries)

    function toPath(points: { x: number; y: number }[]) {
      return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    }

    function toArea(points: { x: number; y: number }[], baseline: number) {
      if (points.length === 0) return ''
      const line = toPath(points)
      const last = points[points.length - 1]
      const first = points[0]
      return `${line} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`
    }

    const baseline = padY + innerH

    return {
      width,
      height,
      myPoints,
      friendPoints,
      myPath: toPath(myPoints),
      friendPath: toPath(friendPoints),
      myArea: toArea(myPoints, baseline),
      friendArea: toArea(friendPoints, baseline),
      gridYs: [0.25, 0.5, 0.75].map((f) => padY + innerH * (1 - f)),
    }
  }, [mySeries, friendSeries])

  const overallLeader =
    streakLeader === sessionLeader && streakLeader !== 'tie' ? streakLeader : null

  return (
    <div className="rounded-2xl bg-surface p-3.5 ring-1 ring-border">
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            7-day rivalry
          </h2>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted">
            <Flame size={12} className="shrink-0 text-amber-500" />
            <span className="tabular-nums">
              <span className={streakLeader === 'you' ? 'font-semibold text-foreground' : ''}>
                {myStreak}d
              </span>
              <span> · </span>
              <span className={streakLeader === 'friend' ? 'font-semibold text-foreground' : ''}>
                {friendStreak}d
              </span>
            </span>
            {streakLeader !== 'tie' && (
              <Crown size={11} className="text-amber-500" aria-hidden />
            )}
          </div>
        </div>
        {overallLeader && (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
            <Crown size={10} />
            {overallLeader === 'you' ? 'You lead' : `${friendLabel} leads`}
          </span>
        )}
      </div>

      <div className="mb-1.5 flex items-center justify-center gap-5 text-[10px]">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3.5 rounded-full bg-sky-500" />
          <span className="text-muted">{myLabel}</span>
          <span className="font-semibold tabular-nums text-sky-500">{myTotal}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3.5 rounded-full bg-violet-500" />
          <span className="text-muted">{friendLabel}</span>
          <span className="font-semibold tabular-nums text-violet-500">
            {friendTotal}
          </span>
        </span>
      </div>

      <svg
        viewBox={`0 0 ${chart.width} ${chart.height}`}
        className="mx-auto w-full max-w-sm"
        role="img"
        aria-label={`7-day workout comparison: ${myLabel} ${myTotal} sessions, ${friendLabel} ${friendTotal} sessions`}
      >
        {chart.gridYs.map((y) => (
          <line
            key={y}
            x1={6}
            y1={y}
            x2={chart.width - 6}
            y2={y}
            className="stroke-border"
            strokeWidth="0.5"
          />
        ))}
        <path d={chart.friendArea} className="fill-violet-500/15" />
        <path d={chart.myArea} className="fill-sky-500/15" />
        <path
          d={chart.friendPath}
          fill="none"
          className="stroke-violet-500"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={chart.myPath}
          fill="none"
          className="stroke-sky-500"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {chart.myPoints.map((point, i) =>
          point.count > 0 ? (
            <circle key={`my-${i}`} cx={point.x} cy={point.y} r={2.5} className="fill-sky-500" />
          ) : null,
        )}
        {chart.friendPoints.map((point, i) =>
          point.count > 0 ? (
            <circle
              key={`friend-${i}`}
              cx={point.x}
              cy={point.y}
              r={2.5}
              className="fill-violet-500"
            />
          ) : null,
        )}
      </svg>

      <div className="mt-1 flex justify-between gap-0.5 px-0.5">
        {mySeries.map((day) => (
          <span key={day.key} className="flex-1 text-center text-[9px] text-muted">
            {day.label}
          </span>
        ))}
      </div>
    </div>
  )
}
