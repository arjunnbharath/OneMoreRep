import type { RefObject } from 'react'
import { useNavigate } from 'react-router-dom'
import WorkoutCalendar from '../../components/WorkoutCalendar'
import TodayPlanCard from '../../components/home/TodayPlanCard'
import HomeStatsStrip from '../../components/home/HomeStatsStrip'
import MuscleExerciseList from '../../components/home/MuscleExerciseList'
import AppWordmark from '../../components/AppWordmark'
import { getTodayWeekday } from '../../lib/workoutPlan'
import type { WeeklyPlan } from '../../types/workoutPlan'

interface HomeMobileProps {
  stats: { completed: number; minutes: number; streak: number }
  todayCalories: number
  sessions: import('../../types/tracker').WorkoutSession[]
  plan: WeeklyPlan
  workoutsRef: RefObject<HTMLElement | null>
}

export default function HomeMobile({
  stats,
  todayCalories,
  sessions,
  plan,
  workoutsRef,
}: HomeMobileProps) {
  const navigate = useNavigate()

  return (
    <div className="min-h-full bg-background text-foreground lg:hidden">
      <header className="px-5 pb-6 pt-[max(2rem,env(safe-area-inset-top))]">
        <AppWordmark className="mb-4" />
        <HomeStatsStrip stats={stats} todayCalories={todayCalories} />

        <div className="mt-5 overflow-x-hidden">
          <TodayPlanCard
            plan={plan}
            onPlan={() => navigate('/tracker', { state: { view: 'plan' } })}
            onStart={() =>
              navigate('/tracker', { state: { startDay: getTodayWeekday() } })
            }
          />
        </div>
      </header>

      <div className="space-y-8 px-5 pb-4 lg:pb-8">
        <WorkoutCalendar sessions={sessions} />

        <section id="workouts" ref={workoutsRef}>
          <div>
            <h2 className="text-base font-semibold">Workouts</h2>
            <p className="mt-0.5 text-xs text-muted">Tap a muscle to see exercises</p>
          </div>

          <div className="mt-4">
            <MuscleExerciseList />
          </div>
        </section>
      </div>
    </div>
  )
}
