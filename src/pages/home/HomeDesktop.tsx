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
  const recentSessions = sessions.slice(0, 4)

  return (
    <div className="hidden min-h-full bg-background text-foreground lg:block">
      <div className="border-b border-border px-10 py-6">
        <p className="text-xs text-muted">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>

        <div className="mt-4 max-w-xl">
          <HomeStatsStrip stats={stats} todayCalories={todayCalories} />
        </div>

        <div className="mt-4 max-w-xl overflow-x-hidden">
          <TodayPlanCard
            plan={plan}
            onPlan={() => navigate('/tracker', { state: { view: 'plan' } })}
            onStart={() =>
              navigate('/tracker', { state: { startDay: getTodayWeekday() } })
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-[340px_minmax(0,1fr)] gap-8 px-10 py-8 xl:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <WorkoutCalendar sessions={sessions} variant="sidebar" />

          <div className="rounded-2xl border border-border p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
              Overview
            </p>
            <div className="mt-4">
              <HomeStatsStrip stats={stats} todayCalories={todayCalories} />
            </div>
          </div>

          <div className="rounded-2xl border border-border p-5">
            <p className="text-sm font-semibold">Recent activity</p>
            {recentSessions.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {recentSessions.map((session) => (
                  <li
                    key={session.id}
                    className="flex items-center justify-between rounded-xl bg-surface px-3 py-2.5 text-sm"
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
              <p className="mt-2 text-sm text-muted">No sessions yet. Start your first workout.</p>
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

        <div className="min-w-0 space-y-8">
          <section id="workouts" ref={workoutsRef}>
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Workouts</h2>
              <p className="mt-1 text-sm text-muted">Tap a muscle group to browse exercises</p>
            </div>

            <div className="mt-6 max-w-2xl">
              <MuscleExerciseList />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
