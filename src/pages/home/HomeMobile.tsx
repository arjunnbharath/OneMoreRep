import { useNavigate } from 'react-router-dom'
import WorkoutCalendar from '../../components/WorkoutCalendar'
import TodayPlanCard from '../../components/home/TodayPlanCard'
import HomeStatsStrip from '../../components/home/HomeStatsStrip'
import WinterArcCard from '../../components/home/WinterArcCard'
import AppWordmark from '../../components/AppWordmark'
import { getTodayWeekday } from '../../lib/workoutPlan'
import type { WinterArcProgress } from '../../types/winterArc'
import type { WeeklyPlan } from '../../types/workoutPlan'

interface HomeMobileProps {
  stats: { streak: number; thisWeek: number }
  sessionCount: number
  todayCalories: number
  sessions: import('../../types/tracker').WorkoutSession[]
  plan: WeeklyPlan
  showWinterArc?: boolean
  winterArcProgress?: WinterArcProgress | null
  winterArcTaskSummary?: { completed: number; total: number }
  pendingHabits?: string[]
}

export default function HomeMobile({
  stats,
  sessionCount,
  todayCalories,
  sessions,
  plan,
  showWinterArc,
  winterArcProgress,
  winterArcTaskSummary,
  pendingHabits,
}: HomeMobileProps) {
  const navigate = useNavigate()

  return (
    <div className="min-h-full bg-background text-foreground lg:hidden">
      <header className="px-5 pb-6 pt-[max(2rem,env(safe-area-inset-top))]">
        <AppWordmark className="mb-4" />
        <HomeStatsStrip
          stats={stats}
          sessionCount={sessionCount}
          todayCalories={todayCalories}
        />

        <div className="mt-5 space-y-4 overflow-x-hidden">
          <TodayPlanCard
            plan={plan}
            onPlan={() => navigate('/tracker/plan')}
            onStart={() =>
              navigate('/tracker/workout', { state: { startDay: getTodayWeekday() } })
            }
          />
          {showWinterArc && winterArcProgress && (
            <WinterArcCard
              progress={winterArcProgress}
              tasksCompleted={winterArcTaskSummary?.completed ?? 0}
              tasksTotal={winterArcTaskSummary?.total ?? 0}
              pendingHabits={pendingHabits ?? []}
              onOpen={() => navigate('/winter-arc')}
            />
          )}
        </div>
      </header>

      <div className="space-y-8 px-5 pb-4 lg:pb-8">
        <WorkoutCalendar sessions={sessions} compact />
      </div>
    </div>
  )
}
