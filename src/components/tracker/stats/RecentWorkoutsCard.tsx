import { useNavigate } from 'react-router-dom'
import { ChevronRight, Dumbbell, Trophy } from 'lucide-react'
import { recentWorkouts } from '../../../lib/statsInsights'
import { TRACKER_PATHS } from '../../../lib/trackerPaths'
import type { WorkoutSession } from '../../../types/tracker'
import { StatsCard } from './StatsChrome'

interface RecentWorkoutsCardProps {
  sessions: WorkoutSession[]
}

export default function RecentWorkoutsCard({ sessions }: RecentWorkoutsCardProps) {
  const navigate = useNavigate()
  const rows = recentWorkouts(sessions).slice(0, 6)
  if (rows.length === 0) return null

  return (
    <StatsCard>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Recent workouts</h2>
        <button
          type="button"
          onClick={() => navigate(TRACKER_PATHS.workoutHistory)}
          className="flex items-center gap-0.5 text-sm font-medium text-foreground"
        >
          All {sessions.length}
          <ChevronRight size={18} />
        </button>
      </div>

      <ul className="-mx-4 mt-2">
        {rows.map((row) => (
          <li key={row.id}>
            <button
              type="button"
              onClick={() => navigate(TRACKER_PATHS.workoutHistory)}
              className="flex w-full items-center gap-4 px-4 py-3 text-left transition hover:bg-foreground/[0.04] active:bg-foreground/[0.08]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground/[0.07] text-foreground">
                <Dumbbell size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base leading-6">{row.name}</span>
                <span className="block text-sm leading-5 text-muted">
                  {row.dateLabel} · {row.durationLabel} · {row.sets} sets
                  {row.volume > 0 ? ` · ${row.volume.toLocaleString()} kg` : ''}
                </span>
              </span>
              {row.prs > 0 && (
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-foreground/[0.07] px-2 py-1 text-[11px] font-medium text-foreground">
                  <Trophy size={12} />
                  {row.prs}
                </span>
              )}
              <ChevronRight size={20} className="shrink-0 text-muted" />
            </button>
          </li>
        ))}
      </ul>
    </StatsCard>
  )
}
