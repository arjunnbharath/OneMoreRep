import type { RefObject } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Play } from 'lucide-react'
import WorkoutCard from '../../components/WorkoutCard'
import WorkoutCalendar from '../../components/WorkoutCalendar'
import UserAvatar from '../../components/UserAvatar'
import TodayPlanCard from '../../components/home/TodayPlanCard'
import { exerciseGuides } from '../../data/exerciseGuides'
import { findVideoForExercise } from '../../data/workoutVideos'
import { getTodayWeekday } from '../../lib/workoutPlan'
import type { MuscleGroup, Workout } from '../../data/mockData'
import type { WeeklyPlan } from '../../types/workoutPlan'
import type { HomeFilter } from './homeTypes'

interface HomeMobileProps {
  firstName: string
  userName?: string
  avatarUrl?: string | null
  stats: { completed: number; minutes: number; streak: number }
  sessions: import('../../types/tracker').WorkoutSession[]
  plan: WeeklyPlan
  activeFilter: MuscleGroup | 'all'
  onFilterChange: (filter: MuscleGroup | 'all') => void
  homeFilters: HomeFilter[]
  filteredWorkouts: Workout[]
  isBookmarked: (id: string) => boolean
  onBookmarkToggle: (id: string) => void
  workoutsRef: RefObject<HTMLElement | null>
}

export default function HomeMobile({
  firstName,
  userName,
  avatarUrl,
  stats,
  sessions,
  plan,
  activeFilter,
  onFilterChange,
  homeFilters,
  filteredWorkouts,
  isBookmarked,
  onBookmarkToggle,
  workoutsRef,
}: HomeMobileProps) {
  const navigate = useNavigate()

  return (
    <div className="min-h-full bg-background text-foreground lg:hidden">
      <header className="px-5 pb-6 pt-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
              OneMoreRep
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Hi, {firstName}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            aria-label="Profile"
            className="transition hover:opacity-70"
          >
            <UserAvatar name={userName} avatarUrl={avatarUrl} size="sm" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            { value: stats.completed, label: 'Sessions' },
            { value: stats.minutes, label: 'Minutes' },
            { value: stats.streak, label: 'Streak' },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="rounded-2xl bg-surface px-3 py-3 ring-1 ring-border"
            >
              <p className="text-xl font-semibold tabular-nums">{value}</p>
              <p className="mt-0.5 text-[10px] text-muted">{label}</p>
            </div>
          ))}
        </div>

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

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => navigate('/tracker')}
            className="flex items-center justify-center gap-2 rounded-2xl bg-foreground px-4 py-3.5 text-sm font-medium text-background transition hover:opacity-90"
          >
            <Play size={16} />
            Start session
          </button>
          <button
            type="button"
            onClick={() => navigate('/exercises')}
            className="rounded-2xl bg-surface px-4 py-3.5 text-sm font-medium ring-1 ring-border transition hover:ring-foreground/20"
          >
            Exercise library
          </button>
        </div>

        <section id="workouts" ref={workoutsRef}>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-base font-semibold">Workouts</h2>
              <p className="mt-0.5 text-xs text-muted">{filteredWorkouts.length} programs</p>
            </div>
            {activeFilter !== 'all' && (
              <button
                type="button"
                onClick={() => onFilterChange('all')}
                className="text-xs font-medium text-muted"
              >
                Clear
              </button>
            )}
          </div>

          <div className="scrollbar-hide -mx-5 mt-4 flex gap-2 overflow-x-auto px-5">
            {homeFilters.map((filter) => {
              const isActive = activeFilter === filter.id
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => onFilterChange(filter.id)}
                  className={[
                    'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition',
                    isActive
                      ? 'bg-foreground text-background'
                      : 'bg-surface text-muted ring-1 ring-border',
                  ].join(' ')}
                >
                  {filter.label}
                </button>
              )
            })}
          </div>

          {filteredWorkouts.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {filteredWorkouts.map((workout) => {
                const video = findVideoForExercise(
                  workout.exercises[0]?.name ?? workout.title,
                )
                return (
                  <WorkoutCard
                    key={workout.id}
                    id={workout.id}
                    title={workout.shortTitle ?? workout.title}
                    duration={workout.duration}
                    difficulty={workout.difficulty}
                    image={workout.image}
                    video={video?.available ? video.videoPath : undefined}
                    bookmarked={isBookmarked(workout.id)}
                    onBookmarkToggle={() => onBookmarkToggle(workout.id)}
                    onClick={() => navigate(`/workout/${workout.id}`)}
                  />
                )
              })}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-border px-4 py-12 text-center">
              <p className="text-sm font-medium">No workouts found</p>
            </div>
          )}
        </section>

        <button
          type="button"
          onClick={() => navigate('/exercises')}
          className="group flex w-full items-center justify-between rounded-2xl bg-surface px-4 py-4 ring-1 ring-border"
        >
          <div className="text-left">
            <p className="text-sm font-medium">Browse all exercises</p>
            <p className="mt-0.5 text-xs text-muted">{exerciseGuides.length}+ with demo videos</p>
          </div>
          <ArrowRight size={18} className="text-muted group-hover:text-foreground" />
        </button>
      </div>
    </div>
  )
}
