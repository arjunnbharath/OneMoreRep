import { useMemo, useState } from 'react'
import { activityGrid, heatLevel } from '../../../lib/statsInsights'
import type { WorkoutSession } from '../../../types/tracker'
import { StatsCard } from './StatsChrome'

const LEVELS = [
  'bg-foreground/10',
  'bg-emerald-900',
  'bg-emerald-700',
  'bg-emerald-500',
  'bg-emerald-300',
]

interface ActivityHeatmapProps {
  sessions: WorkoutSession[]
}

export default function ActivityHeatmap({ sessions }: ActivityHeatmapProps) {
  const [metric, setMetric] = useState<'time' | 'volume'>('time')
  const grid = useMemo(() => activityGrid(sessions, metric), [sessions, metric])

  return (
    <StatsCard>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Activity — last 12 months</h2>
      </div>

      <div className="mt-3 inline-flex rounded-full bg-background p-1">
        {(['time', 'volume'] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setMetric(id)}
            className={[
              'rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition',
              metric === id ? 'bg-foreground text-background' : 'text-muted',
            ].join(' ')}
          >
            {id}
          </button>
        ))}
      </div>

      <div className="scrollbar-hide mt-4 overflow-x-auto pb-1">
        <div className="min-w-max">
          <div className="flex h-4 gap-1">
            {grid.weeks.map((week, index) => (
              <div key={index} className="relative h-4 w-3">
                {week.month && (
                  <span className="absolute left-0 top-0 whitespace-nowrap text-[10px] text-muted">
                    {week.month}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-1 flex gap-1">
            {grid.weeks.map((week, index) => (
              <div key={index} className="flex flex-col gap-1">
                {week.days.map((day) => (
                  <span
                    key={day.key}
                    title={day.inFuture ? '' : `${day.key}: ${day.value || 'rest'}`}
                    className={[
                      'block h-3 w-3 rounded-[3px]',
                      day.inFuture ? 'bg-transparent' : LEVELS[heatLevel(day.value, grid.max)],
                      day.isToday ? 'ring-1 ring-foreground' : '',
                    ].join(' ')}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-muted">
        <span>{metric === 'time' ? 'Less time' : 'Less volume'}</span>
        {LEVELS.map((level) => (
          <span key={level} className={`h-2.5 w-2.5 rounded-[3px] ${level}`} />
        ))}
        <span>{metric === 'time' ? 'More time' : 'More volume'}</span>
      </div>
    </StatsCard>
  )
}
