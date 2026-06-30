import { Star } from 'lucide-react'

interface WorkoutCardProps {
  title: string
  stat: string
  rating: number
  image: string
  onClick?: () => void
}

export default function WorkoutCard({ title, stat, rating, image, onClick }: WorkoutCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative h-52 w-full overflow-hidden rounded-3xl text-left transition-transform hover:scale-[1.01] active:scale-[0.99] lg:h-64"
    >
      <img
        src={image}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <div className="mt-1 flex items-center gap-3 text-sm text-white/80">
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
