import { BarChart2, Bookmark, Clock, Flame } from 'lucide-react'
import type { Difficulty, IntensityLevel } from '../data/mockData'

const difficultyStyles: Record<Difficulty, string> = {
  Beginner: 'text-white/90',
  Intermediate: 'text-white',
  Advanced: 'text-white font-extrabold',
}

interface WorkoutCardProps {
  id: string
  title: string
  image: string
  video?: string
  duration: string
  calories: number
  intensity: IntensityLevel
  difficulty: Difficulty
  bookmarked?: boolean
  onBookmarkToggle?: () => void
  onClick?: () => void
}

export default function WorkoutCard({
  title,
  image,
  video,
  duration,
  calories,
  intensity,
  difficulty,
  bookmarked = false,
  onBookmarkToggle,
  onClick,
}: WorkoutCardProps) {
  const intensityLabel = intensity === 'Medium' ? 'Med' : intensity

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
      className="group relative aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-2xl text-left ring-1 ring-border transition hover:ring-foreground/30"
    >
      {video ? (
        <video
          src={video}
          poster={image}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <img
          src={image}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />

      <span
        className={[
          'absolute left-3 top-3 rounded-lg bg-black/60 px-2 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm',
          difficultyStyles[difficulty],
        ].join(' ')}
      >
        {difficulty}
      </span>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onBookmarkToggle?.()
        }}
        aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark workout'}
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/80"
      >
        <Bookmark size={14} className={bookmarked ? 'fill-white' : ''} />
      </button>

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <h3 className="text-sm font-bold leading-tight text-white">{title}</h3>
        <div className="mt-2 flex items-center gap-3 text-[10px] text-white/75">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {duration}
          </span>
          <span className="flex items-center gap-1">
            <Flame size={11} />
            {calories}
          </span>
          <span className="flex items-center gap-1">
            <BarChart2 size={11} />
            {intensityLabel}
          </span>
        </div>
      </div>
    </div>
  )
}
