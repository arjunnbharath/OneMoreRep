import { Play, Star } from 'lucide-react'

interface WorkoutCardProps {
  title: string
  stat: string
  rating: number
  image: string
  duration?: string
  onClick?: () => void
}

export default function WorkoutCard({
  title,
  stat,
  rating,
  image,
  duration,
  onClick,
}: WorkoutCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative aspect-[4/5] w-full overflow-hidden rounded-3xl text-left shadow-sm transition hover:shadow-lg active:scale-[0.98]"
    >
      <img
        src={image}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

      <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition group-hover:bg-white group-hover:text-black">
        <Play size={16} className="ml-0.5" fill="currentColor" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="mb-2 flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <Star size={11} className="fill-white" />
            {rating}
          </span>
          {duration && (
            <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
              {duration}
            </span>
          )}
        </div>
        <h3 className="text-lg font-bold leading-tight text-white">{title}</h3>
        <p className="mt-1 text-sm text-white/70">{stat}</p>
      </div>
    </button>
  )
}
