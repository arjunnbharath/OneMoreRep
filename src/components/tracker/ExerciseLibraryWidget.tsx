import { BookOpen, ChevronRight } from 'lucide-react'
import { exerciseGroups } from '../../data/exerciseGuides'

interface ExerciseLibraryWidgetProps {
  onOpen: () => void
}

export default function ExerciseLibraryWidget({
  onOpen,
}: ExerciseLibraryWidgetProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group w-full overflow-hidden rounded-2xl bg-gradient-to-br from-sky-50/80 via-surface to-surface text-left ring-1 ring-border transition hover:ring-sky-300/40 dark:from-sky-950/25 dark:via-surface dark:to-surface dark:hover:ring-sky-700/40"
    >
      <div className="flex items-center justify-between gap-3 px-4 pt-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-100 to-blue-100 text-blue-600 shadow-sm ring-1 ring-blue-200/50 dark:from-sky-950/70 dark:to-blue-950/70 dark:text-sky-300 dark:ring-sky-800/50">
            <BookOpen size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold">Exercise library</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 text-xs font-medium text-blue-600/90 transition group-hover:text-blue-600 dark:text-sky-400/90 dark:group-hover:text-sky-300">
          Browse
          <ChevronRight
            size={16}
            className="transition group-hover:translate-x-0.5"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 p-4 pt-3">
        {exerciseGroups.map((group) => (
          <div
            key={group.id}
            className="relative aspect-[4/5] overflow-hidden rounded-xl ring-1 ring-border/50 transition duration-300 group-hover:ring-border"
          >
            <img
              src={group.image}
              alt=""
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/5" />
            <span className="absolute right-1 top-1 rounded-md bg-black/45 px-1.5 py-0.5 text-[9px] font-semibold tabular-nums text-white/90 backdrop-blur-sm">
              {group.count}
            </span>
            <p className="absolute inset-x-0 bottom-0 px-1.5 pb-1.5 text-center text-[10px] font-semibold leading-tight text-white drop-shadow-sm">
              {group.label}
            </p>
          </div>
        ))}
      </div>
    </button>
  )
}
