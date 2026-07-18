import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Search } from 'lucide-react'
import { useAppInstalled } from '../../hooks/useAppInstalled'
import {
  exerciseGroups,
  exerciseGuides,
  type ExerciseGroup,
  type ExerciseGuide,
} from '../../data/exerciseGuides'

const filterOptions: { id: ExerciseGroup | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  ...exerciseGroups.map((group) => ({ id: group.id, label: group.label })),
]

interface ExerciseGuidesV2Props {
  embedded?: boolean
  onBack?: () => void
}

function ExerciseRow({
  exercise,
  onOpen,
}: {
  exercise: ExerciseGuide
  onOpen: (id: string) => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(exercise.id)}
        className="group flex w-full items-center gap-3 rounded-xl px-1 py-2 text-left transition hover:bg-surface"
      >
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-black/5 ring-1 ring-border/60">
          <img
            src={exercise.image}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium leading-snug">{exercise.name}</p>
          <p className="mt-0.5 truncate text-xs text-muted">{exercise.equipment}</p>
        </div>
        <ChevronRight
          size={16}
          className="shrink-0 text-muted/50 transition group-hover:text-foreground"
        />
      </button>
    </li>
  )
}

export default function ExerciseGuidesV2({ embedded = false, onBack }: ExerciseGuidesV2Props) {
  const navigate = useNavigate()
  const appInstalled = useAppInstalled()
  const [activeGroup, setActiveGroup] = useState<ExerciseGroup | 'all'>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let list = exerciseGuides
    if (activeGroup !== 'all') list = list.filter((e) => e.group === activeGroup)
    if (!search.trim()) return list
    const q = search.toLowerCase()
    return list.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.equipment.toLowerCase().includes(q) ||
        e.group.includes(q),
    )
  }, [activeGroup, search])

  function goBack() {
    if (onBack) {
      onBack()
      return
    }
    navigate('/tracker/workout')
  }

  function openExercise(id: string) {
    navigate(`/exercises/${id}`)
  }

  const controls = (
    <>
      <div className="mb-4 flex items-center gap-2.5">
        {embedded && !appInstalled && (
          <button
            type="button"
            onClick={goBack}
            className="flex shrink-0 items-center gap-1.5 text-sm text-muted transition hover:text-foreground"
          >
            <ArrowLeft size={15} />
            Workout
          </button>
        )}
        {embedded && !appInstalled && <span className="text-border">·</span>}
        <span
          className={[
            'text-sm text-muted',
            embedded && !appInstalled ? 'ml-auto' : '',
          ].join(' ')}
        >
          Exercise library
        </span>
      </div>

      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="search"
          placeholder="Search by name or equipment"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl bg-surface py-2.5 pl-10 pr-3 text-sm ring-1 ring-border outline-none placeholder:text-muted focus:ring-foreground/25"
        />
      </div>

      <div
        className="scrollbar-hide -mx-5 mt-4 flex gap-2 overflow-x-auto px-5"
        data-tour="exercise-muscle-groups"
      >
        {filterOptions.map(({ id, label }) => {
          const count =
            id === 'all'
              ? exerciseGuides.length
              : exerciseGroups.find((g) => g.id === id)?.count ?? 0

          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveGroup(id)}
              className={
                activeGroup === id
                  ? 'muscle-filter-chip muscle-filter-chip--active'
                  : 'muscle-filter-chip'
              }
            >
              {label}
              <span
                className={
                  activeGroup === id ? 'muscle-filter-chip-count' : 'text-muted/70'
                }
              >
                {' '}
                {count}
              </span>
            </button>
          )
        })}
      </div>
    </>
  )

  const list = (
    <>
      {search.trim() && (
        <p className="mb-3 text-xs text-muted">
          Results for &ldquo;{search.trim()}&rdquo;
        </p>
      )}

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">No exercises found.</p>
      ) : (
        <ul className="space-y-0.5">
          {filtered.map((exercise) => (
            <ExerciseRow key={exercise.id} exercise={exercise} onOpen={openExercise} />
          ))}
        </ul>
      )}
    </>
  )

  if (embedded) {
    return (
      <section className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 bg-background px-5">{controls}</div>
        <div
          className="scrollbar-hide mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[calc(var(--mobile-nav-height)+0.75rem)] lg:pb-6"
          data-tour="exercise-library"
        >
          {list}
        </div>
      </section>
    )
  }

  return (
    <section className="px-5 pb-8 lg:desktop-page-body lg:px-10">
      <div className="desktop-page mx-auto max-w-lg lg:max-w-3xl">
        {controls}
        <div className="mt-5" data-tour="exercise-library">
          {list}
        </div>
      </div>
    </section>
  )
}
