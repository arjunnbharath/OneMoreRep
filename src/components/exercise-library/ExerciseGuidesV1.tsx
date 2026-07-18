import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, ChevronRight, Search } from 'lucide-react'
import {
  exerciseGroupLabels,
  exerciseGroups,
  exerciseGuides,
  type ExerciseGroup,
} from '../../data/exerciseGuides'

const filterOptions: { id: ExerciseGroup | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  ...exerciseGroups.map((group) => ({ id: group.id, label: group.label })),
]

interface ExerciseGuidesV1Props {
  embedded?: boolean
  onBack?: () => void
}

export default function ExerciseGuidesV1({ embedded = false, onBack }: ExerciseGuidesV1Props) {
  const navigate = useNavigate()
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

  const activeLabel =
    activeGroup === 'all' ? 'All exercises' : exerciseGroupLabels[activeGroup]

  function goBack() {
    if (onBack) {
      onBack()
      return
    }
    if (window.history.length > 1) {
      navigate(-1)
      return
    }
    navigate('/tracker/workout')
  }

  function openExercise(id: string) {
    navigate(`/exercises/${id}`)
  }

  return (
    <div className="min-h-full bg-background text-foreground">
      <div
        className={[
          'z-20 bg-background/95 backdrop-blur-xl',
          embedded
            ? 'border-b border-border/80'
            : 'sticky top-0 border-b border-border/80 lg:static lg:border-0 lg:bg-transparent lg:backdrop-blur-none',
        ].join(' ')}
      >
        <header
          className={[
            'px-5 lg:desktop-page-header lg:px-10',
            embedded ? 'pb-3 pt-1' : 'pt-[max(0.75rem,env(safe-area-inset-top))] lg:pt-6',
          ].join(' ')}
        >
          <div className="lg:desktop-page lg:mx-auto">
            <button
              type="button"
              onClick={goBack}
              className="mb-3 flex items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground lg:hidden"
            >
              <ArrowLeft size={16} />
              {embedded ? 'Back to workout' : 'Back'}
            </button>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-5">
              <div className="flex items-center gap-3">
                <div className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-foreground text-background lg:flex">
                  <BookOpen size={20} />
                </div>
                <div>
                  <p className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-muted lg:block">
                    Library
                  </p>
                  <h1 className="text-xl font-bold tracking-tight lg:text-3xl">Exercise library</h1>
                  <p className="mt-0.5 text-xs text-muted lg:text-sm">
                    {exerciseGuides.length}+ exercises with demos and tips
                  </p>
                </div>
              </div>

              <div className="flex w-full max-w-md items-center gap-3 rounded-2xl bg-surface px-4 py-3 ring-1 ring-border">
                <Search size={18} className="shrink-0 text-muted" />
                <input
                  type="search"
                  placeholder="Search exercises..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
                />
              </div>
            </div>
          </div>
        </header>

        <div
          className="scrollbar-hide flex gap-2 overflow-x-auto px-5 py-3 lg:hidden"
          data-tour="exercise-muscle-groups"
        >
          {filterOptions.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveGroup(id)}
              className={[
                'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition',
                activeGroup === id
                  ? 'bg-foreground text-background shadow-sm'
                  : 'bg-surface text-muted ring-1 ring-border',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div
        className={[
          'px-5 pt-4 lg:desktop-page-body lg:px-10 lg:pb-8 lg:pt-8',
          embedded ? 'pb-8' : 'pb-[calc(var(--mobile-nav-height)+1.5rem)]',
        ].join(' ')}
      >
        <div className="lg:desktop-page lg:mx-auto lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden lg:block lg:sticky lg:top-8 lg:self-start">
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
                Muscle groups
              </h2>
              <div className="mt-3 flex flex-col gap-1.5" data-tour="exercise-muscle-groups">
                <button
                  type="button"
                  onClick={() => setActiveGroup('all')}
                  className={[
                    'w-full rounded-2xl px-4 py-3 text-left transition',
                    activeGroup === 'all'
                      ? 'bg-foreground text-background'
                      : 'bg-surface ring-1 ring-border hover:bg-surface-elevated',
                  ].join(' ')}
                >
                  <span className="text-sm font-semibold">All exercises</span>
                  <span className="mt-0.5 block text-xs opacity-70">{exerciseGuides.length}</span>
                </button>
                {exerciseGroups.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => setActiveGroup(group.id)}
                    className={[
                      'w-full overflow-hidden rounded-2xl text-left transition',
                      activeGroup === group.id
                        ? 'ring-2 ring-foreground'
                        : 'ring-1 ring-border hover:ring-foreground/30',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-3 bg-surface p-3">
                      <img src={group.image} alt="" className="h-12 w-12 rounded-xl object-cover" />
                      <div>
                        <span className="text-sm font-semibold">{group.label}</span>
                        <span className="mt-0.5 block text-xs text-muted">{group.count}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </aside>

          <section data-tour="exercise-library">
            <div className="mb-3 flex items-baseline justify-between gap-2 lg:mb-4">
              <h2 className="text-sm font-semibold lg:hidden">{activeLabel}</h2>
              <p className="text-sm text-muted lg:ml-auto">{filtered.length} exercises</p>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-2xl bg-surface px-6 py-12 text-center ring-1 ring-border">
                <p className="font-medium">No exercises found</p>
                <p className="mt-1 text-sm text-muted">Try a different search or muscle group.</p>
              </div>
            ) : (
              <>
                <ul className="space-y-2 lg:hidden">
                  {filtered.map((exercise) => (
                    <li key={exercise.id}>
                      <button
                        type="button"
                        onClick={() => openExercise(exercise.id)}
                        className="group flex w-full items-center gap-3 rounded-2xl bg-surface p-3 text-left ring-1 ring-border transition active:scale-[0.99]"
                      >
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-black ring-1 ring-border/80">
                          <img src={exercise.image} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold">{exercise.name}</p>
                          <p className="mt-0.5 truncate text-xs text-muted">
                            {exercise.equipment} · {exerciseGroupLabels[exercise.group]}
                          </p>
                        </div>
                        <ChevronRight
                          size={18}
                          className="shrink-0 text-muted transition group-hover:text-foreground"
                        />
                      </button>
                    </li>
                  ))}
                </ul>

                <ul className="hidden gap-3 lg:grid lg:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((exercise) => (
                    <li key={exercise.id}>
                      <button
                        type="button"
                        onClick={() => openExercise(exercise.id)}
                        className="group flex h-full w-full flex-col overflow-hidden rounded-2xl bg-surface text-left ring-1 ring-border transition hover:-translate-y-0.5 hover:ring-foreground/20"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden bg-black">
                          <img
                            src={exercise.image}
                            alt=""
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="flex flex-1 items-center justify-between gap-3 p-4">
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{exercise.name}</p>
                            <p className="mt-0.5 text-xs text-muted">
                              {exercise.equipment} · {exerciseGroupLabels[exercise.group]}
                            </p>
                          </div>
                          <ChevronRight
                            size={18}
                            className="shrink-0 text-muted transition group-hover:text-foreground"
                          />
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
