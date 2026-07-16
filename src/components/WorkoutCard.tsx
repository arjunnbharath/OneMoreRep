import { Bookmark, Clock } from 'lucide-react'
import type { Difficulty } from '../data/mockData'

interface WorkoutCardProps {
  id: string
  title: string
  image: string
  duration: string
  difficulty: Difficulty
  bookmarked?: boolean
  onBookmarkToggle?: () => void
  onClick?: () => void
}

export default function WorkoutCard({
  title,
  image,
  duration,
  difficulty,
  bookmarked = false,
  onBookmarkToggle,
  onClick,
}: WorkoutCardProps) {
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
      className="group relative aspect-[4/5] w-full cursor-pointer overflow-hidden rounded-xl bg-surface text-left ring-1 ring-border transition hover:ring-foreground/20"
    >
      <img
        src={image}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onBookmarkToggle?.()
        }}
        aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark workout'}
        className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50"
      >
        <Bookmark size={13} className={bookmarked ? 'fill-white' : ''} />
      </button>

      <div className="absolute bottom-0 left-0 right-0 p-3.5">
        <p className="text-[10px] font-medium uppercase tracking-wider text-white/60">
          {difficulty}
        </p>
        <h3 className="mt-1 text-sm font-semibold leading-snug text-white">{title}</h3>
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-white/70">
          <Clock size={11} />
          <span>{duration}</span>
        </div>
      </div>
    </div>
  )
}
