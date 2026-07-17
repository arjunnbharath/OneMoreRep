import type { RefObject } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play } from 'lucide-react'
import WorkoutCalendar from '../../components/WorkoutCalendar'
import TodayPlanCard from '../../components/home/TodayPlanCard'
import HomeStatsStrip from '../../components/home/HomeStatsStrip'
import MuscleExerciseList from '../../components/home/MuscleExerciseList'
import { getTodayWeekday } from '../../lib/workoutPlan'
import type { WorkoutSession } from '../../types/tracker'
import type { WeeklyPlan } from '../../types/workoutPlan'

interface HomeDesktopProps {
  stats: { completed: number; minutes: number; streak: number }
  todayCalories: number
  sessions: WorkoutSession[]
  plan: WeeklyPlan
  workoutsRef: RefObject<HTMLElement | null>
}

export default function HomeDesktop({
  stats,
  todayCalories,
  sessions,
  plan,
  workoutsRef,
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
              Your training hub — plan workouts, browse exercises, and track progress.
            </p>
          </div>

          <div className="hidden min-w-[28rem] xl:block">
            <HomeStatsStrip stats={stats} todayCalories={todayCalories} />
          </div>
        </div>

        <div className="desktop-page mx-auto mt-6 max-w-3xl">
          <TodayPlanCard
            plan={plan}
            onPlan={() => navigate('/tracker/plan')}
            onStart={() =>
              navigate('/tracker/workout', { state: { startDay: getTodayWeekday() } })
            }
          />
        </div>
      </header>

      <div className="desktop-page-body desktop-page">
        <div className="grid grid-cols-[minmax(280px,340px)_minmax(0,1fr)] gap-8 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <WorkoutCalendar sessions={sessions} variant="sidebar" />

            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm ring-1 ring-border">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                Overview
              </p>
              <div className="mt-4 xl:hidden">
                <HomeStatsStrip stats={stats} todayCalories={todayCalories} />
              </div>
              <div className="mt-4 hidden xl:block">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Workouts', value: stats.completed },
                    { label: 'Minutes', value: stats.minutes },
                    { label: 'Streak', value: stats.streak },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl bg-background px-3 py-3 text-center ring-1 ring-border">
                      <p className="text-lg font-semibold tabular-nums">{value}</p>
                      <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
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

          <section id="workouts" ref={workoutsRef} className="min-w-0">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Exercise library</h2>
                <p className="mt-1 text-sm text-muted">Browse by muscle group and open exercise guides</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/exercises')}
                className="rounded-xl bg-surface px-4 py-2 text-sm font-medium ring-1 ring-border transition hover:bg-surface-elevated"
              >
                All exercises
              </button>
            </div>

            <div className="mt-6">
              <MuscleExerciseList />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
