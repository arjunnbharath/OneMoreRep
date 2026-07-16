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
      <header className="px-5 pt-6 lg:px-10">
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="mb-4 flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
            <BookOpen size={20} className="text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Exercise Guides</h1>
            <p className="text-xs text-muted">{exerciseGuides.length}+ exercises</p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 ring-1 ring-border">
          <Search size={18} className="shrink-0 text-muted" />
          <input
            type="search"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </div>
      </header>

      <section className="mt-6 px-5 lg:px-10">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Muscle groups
        </h2>
        <div className="scrollbar-hide -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-wrap lg:px-0">
          <button
            type="button"
            onClick={() => setActiveGroup('all')}
            className={[
              'shrink-0 rounded-2xl px-4 py-3 text-left transition',
              activeGroup === 'all'
                ? 'bg-accent text-accent-foreground'
                : 'bg-surface ring-1 ring-border',
            ].join(' ')}
          >
            <span className="text-sm font-semibold">All</span>
            <span className="mt-0.5 block text-xs opacity-70">{exerciseGuides.length}</span>
          </button>
          {exerciseGroups.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => setActiveGroup(group.id)}
              className={[
                'shrink-0 overflow-hidden rounded-2xl text-left transition',
                activeGroup === group.id
                  ? 'ring-2 ring-foreground'
                  : 'ring-1 ring-border',
              ].join(' ')}
            >
              <div className="relative h-20 w-28">
                <img src={group.image} alt="" className="h-full w-full object-cover opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                <div className="absolute bottom-2 left-2 text-white">
                  <span className="text-xs font-bold">{group.label}</span>
                  <span className="block text-[10px] text-white/70">{group.count}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8 px-5 pb-4 lg:px-10 lg:pb-8">
        <p className="mb-4 text-sm text-muted">{filtered.length} exercises</p>
        <ul className="space-y-2">
          {filtered.map((exercise) => (
              <li key={exercise.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/exercises/${exercise.id}`)}
                  className="group flex w-full items-center gap-4 rounded-2xl bg-surface p-3 text-left ring-1 ring-border transition hover:ring-foreground/20"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-black">
                    <img src={exercise.image} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{exercise.name}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {exercise.equipment} • {exercise.group}
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
      </section>
    </div>
  )
}
