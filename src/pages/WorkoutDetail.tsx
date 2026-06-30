import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  CirclePlay,
  Heart,
  Play,
  Star,
} from 'lucide-react'
import { workouts } from '../data/mockData'

export default function WorkoutDetail() {
  const { id } = useParams()
  const workout = workouts.find((w) => w.id === id) ?? workouts[0]
  const [activeTab, setActiveTab] = useState<'videos' | 'review'>('videos')
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <div className="lg:grid lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-2">
      <div className="relative aspect-video w-full lg:aspect-auto lg:min-h-full">
        <img
          src={workout.image}
          alt={workout.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <Link
          to="/home"
          className="absolute left-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-black backdrop-blur transition hover:bg-white"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </Link>
        <button
          type="button"
          aria-label="Play video"
          className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black backdrop-blur transition hover:scale-105 hover:bg-white"
        >
          <Play size={28} className="ml-1" fill="currentColor" />
        </button>
      </div>

      <div className="px-5 py-6 lg:overflow-y-auto lg:px-10 lg:py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">{workout.title}</h1>
            <div className="mt-2 flex items-center gap-4 text-sm text-neutral-500">
              <span className="flex items-center gap-1">
                <Star size={16} className="fill-black text-black" />
                {workout.rating}
              </span>
              <span>{workout.duration}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsFavorite(!isFavorite)}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className={[
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition',
              isFavorite
                ? 'border-black bg-black text-white'
                : 'border-neutral-200 bg-white text-black hover:bg-neutral-50',
            ].join(' ')}
          >
            <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
          </button>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('videos')}
            className={[
              'rounded-full px-5 py-2.5 text-sm font-semibold transition',
              activeTab === 'videos'
                ? 'bg-black text-white'
                : 'bg-surface text-neutral-600 hover:bg-neutral-200',
            ].join(' ')}
          >
            Videos ({workout.exercises.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('review')}
            className={[
              'rounded-full px-5 py-2.5 text-sm font-semibold transition',
              activeTab === 'review'
                ? 'bg-black text-white'
                : 'bg-surface text-neutral-600 hover:bg-neutral-200',
            ].join(' ')}
          >
            Review
          </button>
        </div>

        {activeTab === 'videos' ? (
          <ul className="mt-6 space-y-3">
            {workout.exercises.map((exercise) => (
              <li
                key={exercise.name}
                className="flex items-center gap-4 rounded-2xl bg-surface p-4 transition hover:bg-neutral-200/60"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
                  <CirclePlay size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{exercise.name}</p>
                  <p className="text-sm text-neutral-500">{exercise.duration}</p>
                </div>
                <div
                  className={[
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                    exercise.completed ? 'bg-black text-white' : 'bg-white text-neutral-300',
                  ].join(' ')}
                >
                  <Check size={16} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 rounded-2xl bg-surface p-6 text-center text-neutral-500">
            <p className="font-medium text-black">No reviews yet</p>
            <p className="mt-1 text-sm">Be the first to share your experience.</p>
          </div>
        )}
      </div>
    </div>
  )
}
