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
          className="flex items-center gap-0.5 text-sm font-semibold text-emerald-400"
        >
          All {sessions.length}
          <ChevronRight size={16} />
        </button>
      </div>

      <ul className="mt-3 space-y-2">
        {rows.map((row) => (
          <li key={row.id}>
            <button
              type="button"
              onClick={() => navigate(TRACKER_PATHS.workoutHistory)}
              className="flex w-full items-center gap-3 rounded-2xl bg-black/30 px-3 py-3 text-left ring-1 ring-white/5 transition hover:bg-white/5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-black">
                <Dumbbell size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{row.name}</span>
                <span className="mt-0.5 block text-xs text-zinc-400">
                  {row.dateLabel} · {row.durationLabel} · {row.sets} sets
                  {row.volume > 0 ? ` · ${row.volume.toLocaleString()} kg` : ''}
                </span>
              </span>
              {row.prs > 0 && (
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-400/15 px-2 py-1 text-[11px] font-semibold text-amber-300">
                  <Trophy size={12} />
                  {row.prs} PR
                </span>
              )}
              <ChevronRight size={16} className="shrink-0 text-zinc-600" />
            </button>
          </li>
        ))}
      </ul>
    </StatsCard>
  )
}
