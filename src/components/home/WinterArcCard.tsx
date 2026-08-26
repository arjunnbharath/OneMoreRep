import { ChevronRight, Snowflake } from 'lucide-react'
import { formatWinterArcEndDate } from '../../lib/winterArc'
import type { WinterArcProgress } from '../../types/winterArc'

interface WinterArcCardProps {
  progress: WinterArcProgress
  tasksCompleted: number
  tasksTotal: number
  onOpen: () => void
}

export default function WinterArcCard({
  progress,
  tasksCompleted,
  tasksTotal,
  onOpen,
}: WinterArcCardProps) {
  const { dayNumber, daysRemaining, streak, arcComplete, progressPercent, endDateKey } = progress

  return (
    <button
      type="button"
      onClick={onOpen}
      data-tour="winter-arc"
      className="w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-blue-950 text-left ring-1 ring-white/10 transition hover:ring-white/20"
    >
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <Snowflake size={16} className="text-sky-200" />
            </span>
            <div className="min-w-0">
              <p className="text-base font-semibold text-white">
                {arcComplete ? 'Winter Arc complete' : `Day ${dayNumber}`}
              </p>
              {!arcComplete && (
                <p className="text-xs text-white/55">
                  {daysRemaining}d left · ends {formatWinterArcEndDate(endDateKey)}
                </p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {streak > 0 && (
              <span className="text-sm font-semibold tabular-nums text-white">{streak}🔥</span>
            )}
            <ChevronRight size={18} className="text-white/45" />
          </div>
        </div>

        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-sky-400"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {!arcComplete && (
          <p className="mt-3 text-sm text-white/70">
            Habits <span className="font-semibold text-white">{tasksCompleted}/{tasksTotal}</span>
          </p>
        )}
      </div>
    </button>
  )
}
