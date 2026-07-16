import SwipeablePlanDayCard from '../plan/SwipeablePlanDayCard'
import { exerciseGroupLabels } from '../../data/exerciseGuides'
import {
  getTodayWeekday,
  imageForDayPlan,
  muscleExerciseCount,
  WEEKDAY_LABELS,
} from '../../lib/workoutPlan'
import type { WeeklyPlan } from '../../types/workoutPlan'

interface TodayPlanCardProps {
  plan: WeeklyPlan
  onPlan: () => void
  onStart: () => void
  playSwipeHint?: boolean
}

export default function TodayPlanCard({
  plan,
  onPlan,
  onStart,
  playSwipeHint = false,
}: TodayPlanCardProps) {
  const today = getTodayWeekday()
  const dayPlan = plan[today]
  const muscles = dayPlan.muscles
  const hasPlan = muscles.length > 0
  const canStart = muscles.some((g) => muscleExerciseCount(dayPlan, g) > 0)
  const exerciseTotal = muscles.reduce(
    (sum, g) => sum + muscleExerciseCount(dayPlan, g),
    0,
  )

  return (
    <SwipeablePlanDayCard
      day={today}
      canStart={canStart}
      isToday
      playHint={playSwipeHint}
      onSelect={onPlan}
      onStart={onStart}
      className="overflow-x-hidden"
    >
      <img
        src={imageForDayPlan(today, dayPlan)}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/45 to-black/30" />

      <div className="relative flex min-h-[5.5rem] items-center gap-3 px-4 py-4 text-white">
        <div className="shrink-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
            Today&apos;s plan
          </p>
          <p className="mt-1 text-base font-bold leading-tight">{WEEKDAY_LABELS[today]}</p>
        </div>

        <div className="min-w-0 flex-1">
          {!hasPlan ? (
            <p className="text-sm text-white/70">Rest day · tap to plan</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-1">
                {muscles.map((group) => (
                  <span
                    key={group}
                    className="rounded-md bg-white/15 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm"
                  >
                    {exerciseGroupLabels[group]}
                  </span>
                ))}
              </div>
              {exerciseTotal > 0 && (
                <p className="mt-1.5 text-xs text-white/60">
                  {exerciseTotal} exercise{exerciseTotal === 1 ? '' : 's'}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </SwipeablePlanDayCard>
  )
}
