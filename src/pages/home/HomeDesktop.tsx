import { useNavigate } from 'react-router-dom'
import { Play } from 'lucide-react'
import WorkoutCalendar from '../../components/WorkoutCalendar'
import TodayPlanCard from '../../components/home/TodayPlanCard'
import HomeStatsStrip from '../../components/home/HomeStatsStrip'
import WinterArcCard from '../../components/home/WinterArcCard'
import { getTodayWeekday } from '../../lib/workoutPlan'
import type { WorkoutSession } from '../../types/tracker'
import type { WinterArcProgress } from '../../types/winterArc'
import type { WeeklyPlan } from '../../types/workoutPlan'

interface HomeDesktopProps {
  stats: { streak: number; thisWeek: number }
  sessionCount: number
  todayCalories: number
  sessions: WorkoutSession[]
  plan: WeeklyPlan
  showWinterArc?: boolean
  winterArcProgress?: WinterArcProgress | null
  winterArcTaskSummary?: { completed: number; total: number }
}

export default function HomeDesktop({
  stats,
  sessionCount,
  todayCalories,
  sessions,
  plan,
  showWinterArc,
  winterArcProgress,
  winterArcTaskSummary,
}: HomeDesktopProps) {
  const navigate = useNavigate()
  const recentSessions = sessions.slice(0, 5)
  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="hidden min-h-full bg-background text-foreground lg:block">
      <header className="desktop-page-header">
        <div className="desktop-page mx-auto flex items-end justify-between gap-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{todayLabel}</h1>
            <p className="mt-2 max-w-xl text-sm text-muted">
              Your training hub — plan workouts and track progress.
            </p>
          </div>

          <div className="hidden min-w-[28rem] xl:block">
            <HomeStatsStrip
              stats={stats}
              sessionCount={sessionCount}
              todayCalories={todayCalories}
            />
          </div>
        </div>

        <div className="desktop-page mx-auto mt-6 max-w-3xl space-y-4">
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
              onOpen={() => navigate('/winter-arc')}
            />
          )}
        </div>
      </header>

      <div className="desktop-page-body desktop-page mx-auto max-w-md">
        <aside className="space-y-6">
            <WorkoutCalendar sessions={sessions} variant="sidebar" compact />

            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm ring-1 ring-border">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                Overview
              </p>
              <div className="mt-4 xl:hidden">
                <HomeStatsStrip
                  stats={stats}
                  sessionCount={sessionCount}
                  todayCalories={todayCalories}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm ring-1 ring-border">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">Recent activity</p>
                <button
                  type="button"
                  onClick={() => navigate('/tracker')}
                  className="text-xs font-medium text-muted hover:text-foreground"
                >
                  View all
                </button>
              </div>
              {recentSessions.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {recentSessions.map((session) => (
                    <li
                      key={session.id}
                      className="flex items-center justify-between rounded-xl bg-background px-3 py-2.5 text-sm ring-1 ring-border"
                    >
                      <span className="truncate font-medium">{session.name}</span>
                      <span className="shrink-0 text-xs text-muted">
                        {new Date(session.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted">No sessions yet. Start your first workout.</p>
              )}
              <button
                type="button"
                onClick={() => navigate('/tracker')}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-2.5 text-sm font-medium text-background transition hover:opacity-90"
              >
                <Play size={15} />
                Open tracker
              </button>
            </div>
        </aside>
      </div>
    </div>
  )
}
