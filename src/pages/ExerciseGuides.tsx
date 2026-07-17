import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, ChevronRight, Search } from 'lucide-react'
import { exerciseGroups, exerciseGuides, type ExerciseGroup } from '../data/exerciseGuides'

export default function ExerciseGuides() {
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

  return (
    <div className="min-h-full bg-background text-foreground">
      <header className="px-5 pt-6 lg:desktop-page-header lg:px-10">
        <div className="lg:desktop-page lg:mx-auto">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="mb-4 flex items-center gap-2 text-sm text-muted transition hover:text-foreground lg:hidden"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-foreground text-background">
                <BookOpen size={20} />
              </div>
              <div>
                <p className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-muted lg:block">
                  Library
                </p>
                <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Exercise Guides</h1>
                <p className="text-xs text-muted lg:text-sm">{exerciseGuides.length}+ exercises with demos and tips</p>
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

      <div className="px-5 pb-8 lg:desktop-page-body lg:px-10 lg:pt-8">
        <div className="lg:desktop-page lg:mx-auto lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <section className="mt-6 lg:mt-0">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
                Muscle groups
              </h2>
              <div className="scrollbar-hide -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:px-0">
                <button
                  type="button"
                  onClick={() => setActiveGroup('all')}
                  className={[
                    'shrink-0 rounded-2xl px-4 py-3 text-left transition lg:w-full',
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
                      'shrink-0 overflow-hidden rounded-2xl text-left transition lg:w-full',
                      activeGroup === group.id
                        ? 'ring-2 ring-foreground'
                        : 'ring-1 ring-border hover:ring-foreground/30',
                    ].join(' ')}
                  >
                    <div className="relative h-20 w-28 lg:flex lg:h-auto lg:w-full lg:items-center lg:gap-3 lg:p-3 lg:bg-surface">
                      <img
                        src={group.image}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover opacity-50 lg:relative lg:h-12 lg:w-12 lg:rounded-xl lg:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent lg:hidden" />
                      <div className="absolute bottom-2 left-2 text-white lg:static lg:text-foreground">
                        <span className="text-xs font-bold lg:text-sm">{group.label}</span>
                        <span className="block text-[10px] text-white/70 lg:text-muted">{group.count}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </aside>

          <section className="mt-8 lg:mt-0">
            <p className="mb-4 text-sm text-muted">{filtered.length} exercises</p>
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((exercise) => (
                <li key={exercise.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/exercises/${exercise.id}`)}
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
                          {exercise.equipment} · {exercise.group}
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
          </section>
        </div>
      </div>
    </div>
  )
}
