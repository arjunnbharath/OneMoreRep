import { Snowflake } from 'lucide-react'
import { formatWinterArcEndDate } from '../../lib/winterArc'
import type { WinterArcProgress } from '../../types/winterArc'

interface WinterArcCardProps {
  progress: WinterArcProgress
  onOpenWorkout: () => void
}

export default function WinterArcCard({ progress, onOpenWorkout }: WinterArcCardProps) {
  const {
    dayNumber,
    totalDays,
    daysRemaining,
    workoutsThisWeek,
    weeklyTarget,
    weeklyMet,
    streak,
    trainedToday,
    arcComplete,
    progressPercent,
    endDateKey,
    totalWorkouts,
  } = progress

  return (
    <section
      data-tour="winter-arc"
      className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-blue-950 ring-1 ring-white/10"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                <Snowflake size={16} className="text-sky-200" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
                  Winter Arc
                </p>
                <p className="text-base font-semibold tracking-tight text-white">
                  {arcComplete ? 'Arc complete' : `Day ${dayNumber} of ${totalDays}`}
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs text-white/55">
              {arcComplete
                ? `${totalWorkouts} workouts logged during your arc`
                : `${daysRemaining} days left · ends ${formatWinterArcEndDate(endDateKey)}`}
            </p>
          </div>
          {streak > 0 && (
            <div className="shrink-0 rounded-xl bg-white/10 px-3 py-2 text-center ring-1 ring-white/10">
              <p className="text-lg font-bold tabular-nums leading-none text-white">{streak}</p>
              <p className="mt-0.5 text-[10px] text-white/50">streak</p>
            </div>
          )}
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[11px] text-white/55">
            <span>Arc progress</span>
            <span className="tabular-nums">{progressPercent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-300 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-white/8 px-3 py-2.5 ring-1 ring-white/10">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-white/45">
              This week
            </p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums text-white">
              {workoutsThisWeek}
              <span className="font-normal text-white/45"> / {weeklyTarget} workouts</span>
            </p>
          </div>
          <span
            className={[
              'rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide',
              weeklyMet
                ? 'bg-emerald-500/20 text-emerald-200'
                : 'bg-white/10 text-white/60',
            ].join(' ')}
          >
            {weeklyMet ? 'On track' : 'Keep going'}
          </span>
        </div>

        {!arcComplete && !trainedToday && (
          <button
            type="button"
            onClick={onOpenWorkout}
            className="mt-4 w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-white/90"
          >
            Log today&apos;s workout
          </button>
        )}
      </div>
    </section>
  )
}
