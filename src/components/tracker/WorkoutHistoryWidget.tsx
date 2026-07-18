import { ChevronRight, History } from 'lucide-react'
import { getSessionDurationSeconds } from '../../lib/workoutProgress'
import type { WorkoutSession } from '../../types/tracker'

const HISTORY_ACCENT = '/images/gym_background/workout history.jpg'

interface WorkoutHistoryWidgetProps {
  sessions: WorkoutSession[]
  formatDate: (iso: string) => string
  onOpen: () => void
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`
  const mins = Math.round(seconds / 60)
  return `${mins} min`
}

export default function WorkoutHistoryWidget({
  sessions,
  formatDate,
  onOpen,
}: WorkoutHistoryWidgetProps) {
  const recent = sessions.slice(0, 3)

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative w-full overflow-hidden rounded-2xl text-left ring-1 ring-border transition hover:ring-foreground/20"
    >
      <div className="relative h-24 overflow-hidden">
        <img
          src={HISTORY_ACCENT}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/35" />
        <div className="relative flex h-full items-end justify-between gap-3 px-4 pb-3.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
              <History size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">Workout history</p>
              <p className="text-xs text-white/70">
                {sessions.length === 0
                  ? 'Your past sessions'
                  : `${sessions.length} session${sessions.length === 1 ? '' : 's'} logged`}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="shrink-0 text-white/75 transition group-hover:translate-x-0.5 group-hover:text-white" />
        </div>
      </div>

      <div className="bg-surface px-4 py-3">
        {recent.length === 0 ? (
          <p className="py-2 text-center text-sm text-muted">No workouts yet — finish one to see it here.</p>
        ) : (
          <ul className="divide-y divide-border/70">
            {recent.map((session) => {
              const duration = getSessionDurationSeconds(session)
              return (
                <li
                  key={session.id}
                  className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{session.name}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {formatDate(session.date)}
                      {duration > 0 ? ` · ${formatDuration(duration)}` : ''}
                      {' · '}
                      {session.exercises.length} exercise{session.exercises.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-background px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
                    {new Date(session.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </button>
  )
}
