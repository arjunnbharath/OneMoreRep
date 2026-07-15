import type { RefObject } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Play,
} from 'lucide-react'
import WorkoutCard from '../../components/WorkoutCard'
import WorkoutCalendar from '../../components/WorkoutCalendar'
import TodayPlanCard from '../../components/home/TodayPlanCard'
import HomeStatsStrip from '../../components/home/HomeStatsStrip'
import { exerciseGuides } from '../../data/exerciseGuides'
import { findVideoForExercise } from '../../data/workoutVideos'
import { getTodayWeekday } from '../../lib/workoutPlan'
import type { MuscleGroup, Workout } from '../../data/mockData'
import type { WorkoutSession } from '../../types/tracker'
import type { WeeklyPlan } from '../../types/workoutPlan'
import type { HomeFilter } from './homeTypes'

interface HomeDesktopProps {
  stats: { completed: number; minutes: number; streak: number }
  todayCalories: number
  sessions: WorkoutSession[]
  plan: WeeklyPlan
  activeFilter: MuscleGroup | 'all'
  onFilterChange: (filter: MuscleGroup | 'all') => void
  homeFilters: HomeFilter[]
  filteredWorkouts: Workout[]
  featuredWorkout: Workout | null
  isBookmarked: (id: string) => boolean
  onBookmarkToggle: (id: string) => void
  workoutsRef: RefObject<HTMLElement | null>
}

export default function HomeDesktop({
  stats,
  todayCalories,
  sessions,
  plan,
  activeFilter,
  onFilterChange,
  homeFilters,
  filteredWorkouts,
  featuredWorkout,
  isBookmarked,
  onBookmarkToggle,
  workoutsRef,
}: HomeDesktopProps) {
  const navigate = useNavigate()
  const recentSessions = sessions.slice(0, 4)
  const featuredVideo = featuredWorkout
    ? findVideoForExercise(featuredWorkout.exercises[0]?.name ?? featuredWorkout.title)
    : null

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

          <button
            type="button"
            onClick={() => navigate('/exercises')}
            className="group flex w-full items-center gap-3 rounded-2xl border border-border p-4 text-left transition hover:bg-surface"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface ring-1 ring-border">
              <BookOpen size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Exercise library</p>
              <p className="text-xs text-muted">{exerciseGuides.length}+ guides</p>
            </div>
            <ArrowRight size={16} className="text-muted group-hover:text-foreground" />
          </button>
        </aside>

        <div className="min-w-0 space-y-8">
          {featuredWorkout && (
            <section className="relative overflow-hidden rounded-2xl ring-1 ring-border">
              {featuredVideo?.available ? (
                <video
                  src={featuredVideo.videoPath}
                  poster={featuredWorkout.image}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <img
                  src={featuredWorkout.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
              <div className="relative flex min-h-[220px] flex-col justify-end p-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                  Featured workout
                </p>
                <h2 className="mt-2 max-w-lg text-3xl font-semibold text-white">
                  {featuredWorkout.title}
                </h2>
                <p className="mt-2 text-sm text-white/70">
                  {featuredWorkout.duration} · {featuredWorkout.difficulty} ·{' '}
                  {featuredWorkout.calories} cal
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`/workout/${featuredWorkout.id}`)}
                  className="mt-5 flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
                >
                  <Play size={16} />
                  Start workout
                </button>
              </div>
            </section>
          )}

          <section id="workouts" ref={workoutsRef}>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">All workouts</h2>
                <p className="mt-1 text-sm text-muted">
                  {filteredWorkouts.length} program{filteredWorkouts.length === 1 ? '' : 's'}
                </p>
              </div>
              {activeFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => onFilterChange('all')}
                  className="text-sm font-medium text-muted hover:text-foreground"
                >
                  Clear filter
                </button>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {homeFilters.map((filter) => {
                const isActive = activeFilter === filter.id
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => onFilterChange(filter.id)}
                    className={[
                      'rounded-full px-4 py-2 text-sm font-medium transition',
                      isActive
                        ? 'bg-foreground text-background'
                        : 'text-muted ring-1 ring-border hover:text-foreground',
                    ].join(' ')}
                  >
                    {filter.label}
                  </button>
                )
              })}
            </div>

            {filteredWorkouts.length > 0 ? (
              <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-3">
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
              <div className="mt-6 rounded-2xl border border-dashed border-border px-6 py-20 text-center">
                <p className="font-medium">No workouts found</p>
                <p className="mt-1 text-sm text-muted">Try another filter or search term</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
