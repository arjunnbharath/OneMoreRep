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
      {/* Pinned wordmark: the page content scrolls underneath it. */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-[calc(var(--sat)+2.75rem)] items-end bg-background/85 px-5 pb-3 backdrop-blur-md">
        <AppWordmark size="lg" />
      </div>
      <header className="px-5 pb-6 pt-[calc(var(--sat)+3.5rem)]">
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
