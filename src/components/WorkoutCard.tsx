import { Clock, Star } from 'lucide-react'

interface WorkoutCardProps {
  title: string
  stat: string
  rating: number
  image: string
  duration?: string
  muscle?: string
  variant?: 'default' | 'featured' | 'compact'
  onClick?: () => void
}

export default function WorkoutCard({
  title,
  stat,
  rating,
  image,
  duration,
  muscle,
  variant = 'default',
  onClick,
}: WorkoutCardProps) {
  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group flex w-full gap-4 rounded-2xl border border-neutral-100 bg-white p-3 text-left transition hover:border-neutral-200 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
      >
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
          <img src={image} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center py-0.5">
          {muscle && (
            <span className="mb-1 w-fit rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
              {muscle}
            </span>
          )}
          <h3 className="truncate font-semibold text-neutral-900 dark:text-white">{title}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
            <span>{stat}</span>
            {duration && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {duration}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star size={12} className="fill-neutral-400 text-neutral-400" />
              {rating}
            </span>
          </div>
        </div>
      </button>
    )
  }

  if (variant === 'featured') {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group relative h-64 w-full overflow-hidden rounded-2xl text-left sm:h-72"
      >
        <img
          src={image}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          {muscle && (
            <span className="mb-2 w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {muscle}
            </span>
          )}
          <h3 className="text-2xl font-bold tracking-tight text-white">{title}</h3>
          <div className="mt-2 flex items-center gap-4 text-sm text-white/80">
            <span>{stat}</span>
            {duration && <span>{duration}</span>}
            <span className="flex items-center gap-1">
              <Star size={14} className="fill-white text-white" />
              {rating}
            </span>
          </div>
        </div>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative h-52 w-full overflow-hidden rounded-2xl text-left transition hover:shadow-md lg:h-60"
    >
      <img
        src={image}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className="mt-1.5 flex items-center gap-3 text-sm text-white/75">
          <span>{stat}</span>
          <span className="flex items-center gap-1">
            <Star size={14} className="fill-white text-white" />
            {rating}
          </span>
        </div>
      </div>
    </button>
  )
}
