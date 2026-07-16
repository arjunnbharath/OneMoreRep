import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Clock, Flame, Heart, Star } from 'lucide-react'
import Button from '../components/Button'
import { workouts } from '../data/mockData'

export default function WorkoutDetail() {
  const { id } = useParams()
  const workout = workouts.find((w) => w.id === id) ?? workouts[0]
  const [activeTab, setActiveTab] = useState<'exercises' | 'review'>('exercises')
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <div className="min-h-full bg-background text-foreground lg:grid lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-2">
      <div className="relative aspect-[4/3] w-full lg:aspect-auto lg:min-h-full">
        <img src={workout.image} alt={workout.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/30" />
        <Link
          to="/home"
          className="absolute left-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-background/80 text-foreground backdrop-blur transition hover:bg-background"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </Link>
      </div>

      <div className="px-5 py-6 lg:overflow-y-auto lg:px-10 lg:py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="rounded-full bg-foreground/10 px-3 py-1 text-xs font-semibold uppercase">
              {workout.muscle}
            </span>
            <h1 className="mt-2 text-2xl font-bold tracking-tight lg:text-3xl">{workout.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted">
              <span className="flex items-center gap-1">
                <Star size={16} className="fill-foreground text-foreground" />
                {workout.rating}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={16} />
                {workout.duration}
              </span>
              <span className="flex items-center gap-1">
                <Flame size={16} />
                {workout.calories} kcal
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsFavorite(!isFavorite)}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className={[
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ring-1',
              isFavorite
                ? 'bg-accent text-accent-foreground ring-accent'
                : 'bg-surface text-muted ring-border hover:text-foreground',
            ].join(' ')}
          >
            <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
          </button>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('exercises')}
            className={[
              'rounded-full px-5 py-2.5 text-sm font-semibold transition',
              activeTab === 'exercises'
                ? 'bg-accent text-accent-foreground'
                : 'bg-surface text-muted ring-1 ring-border',
            ].join(' ')}
          >
            Exercises ({workout.exercises.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('review')}
            className={[
              'rounded-full px-5 py-2.5 text-sm font-semibold transition',
              activeTab === 'review'
                ? 'bg-accent text-accent-foreground'
                : 'bg-surface text-muted ring-1 ring-border',
            ].join(' ')}
          >
            Review
          </button>
        </div>

        {activeTab === 'exercises' ? (
          <ul className="mt-6 space-y-2">
            {workout.exercises.map((exercise) => (
              <li key={exercise.name}>
                <div className="flex w-full items-center gap-4 rounded-2xl bg-surface p-3 ring-1 ring-border">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{exercise.name}</p>
                    <p className="text-xs text-muted">{exercise.duration}</p>
                  </div>
                  <div
                    className={[
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                      exercise.completed
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-surface-elevated text-muted',
                    ].join(' ')}
                  >
                    <Check size={16} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 rounded-2xl bg-surface p-8 text-center ring-1 ring-border">
            <p className="font-medium">No reviews yet</p>
            <p className="mt-1 text-sm text-muted">Be the first to share your experience.</p>
          </div>
        )}

        <Link to="/tracker" className="mt-8 block">
          <Button fullWidth className="py-3.5">
            Start this workout
          </Button>
        </Link>
      </div>
    </div>
  )
}
