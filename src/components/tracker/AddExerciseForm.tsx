import type { FormEvent } from 'react'
import { Search } from 'lucide-react'
import Button from '../Button'

const SET_PRESETS = [
  { label: '3×12', sets: '3', reps: '12' },
  { label: '4×8', sets: '4', reps: '8' },
  { label: '5×5', sets: '5', reps: '5' },
]

interface ExerciseSuggestion {
  id: string
  name: string
}

interface AddExerciseFormProps {
  variant?: 'prominent' | 'compact'
  exerciseName: string
  exerciseQuery: string
  sets: string
  reps: string
  weight: string
  suggestions: ExerciseSuggestion[]
  recentExercises?: string[]
  onQueryChange: (value: string) => void
  onSetsChange: (value: string) => void
  onRepsChange: (value: string) => void
  onWeightChange: (value: string) => void
  onSelectExercise: (name: string) => void
  onQuickAdd: (name: string) => void
  onSubmit: (e: FormEvent) => void
}

export default function AddExerciseForm({
  variant = 'compact',
  exerciseName,
  exerciseQuery,
  sets,
  reps,
  weight,
  suggestions,
  recentExercises = [],
  onQueryChange,
  onSetsChange,
  onRepsChange,
  onWeightChange,
  onSelectExercise,
  onQuickAdd,
  onSubmit,
}: AddExerciseFormProps) {
  const isProminent = variant === 'prominent'
  const displayQuery = exerciseQuery || exerciseName
  const quickPicks = [...new Set([...recentExercises.slice(0, 3)])].slice(0, 3)

  return (
    <div className="rounded-2xl bg-surface p-4 ring-1 ring-border">
      {isProminent && (
        <p className="mb-3 text-sm text-muted">Add your first exercise</p>
      )}

      <form onSubmit={onSubmit}>
        {!isProminent && (
          <label className="text-xs font-medium text-muted">Exercise</label>
        )}
        <div className={isProminent ? '' : 'relative mt-1.5'}>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search exercises..."
              value={displayQuery}
              onChange={(e) => onQueryChange(e.target.value)}
              className="w-full rounded-xl bg-surface-elevated py-3 pl-9 pr-4 text-sm outline-none ring-1 ring-border focus:ring-foreground/30 dark:ring-white/10 dark:focus:ring-white/20"
              required
              autoFocus={isProminent}
            />
          </div>

          {isProminent && quickPicks.length > 0 && !displayQuery && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {quickPicks.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => onQuickAdd(name)}
                  className="text-xs text-muted underline-offset-2 transition hover:text-foreground hover:underline"
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        {suggestions.length > 0 && displayQuery && (
          <ul className="mt-2 max-h-40 overflow-y-auto rounded-xl bg-surface-elevated ring-1 ring-border">
            {suggestions.map((ex) => (
              <li key={ex.id}>
                <button
                  type="button"
                  onClick={() => onSelectExercise(ex.name)}
                  className={[
                    'block w-full px-3 py-2.5 text-left text-sm transition',
                    exerciseName === ex.name
                      ? 'bg-foreground text-background'
                      : 'hover:bg-surface dark:hover:bg-white/5',
                  ].join(' ')}
                >
                  {ex.name}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 flex gap-1.5">
          {SET_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                onSetsChange(preset.sets)
                onRepsChange(preset.reps)
              }}
              className={[
                'rounded-full px-2.5 py-0.5 text-xs transition',
                sets === preset.sets && reps === preset.reps
                  ? 'bg-foreground text-background'
                  : 'text-muted hover:text-foreground',
              ].join(' ')}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-3">
          {(
            [
              { label: 'Sets', value: sets, onChange: onSetsChange, placeholder: '' },
              { label: 'Reps', value: reps, onChange: onRepsChange, placeholder: '' },
              { label: 'kg', value: weight, onChange: onWeightChange, placeholder: '—' },
            ] as const
          ).map(({ label, value, onChange, placeholder }) => (
            <label key={label} className="block text-center">
              <span className="text-[10px] text-muted">{label}</span>
              <input
                type="number"
                min={label === 'kg' ? 0 : 1}
                step={label === 'kg' ? 0.5 : 1}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="no-spinner mt-1 w-full border-b border-border bg-transparent py-1.5 text-center text-sm outline-none focus:border-foreground dark:focus:border-white/40"
              />
            </label>
          ))}
        </div>

        <Button type="submit" fullWidth className="mt-4 py-3">
          {exerciseName.trim() ? `Add ${exerciseName.trim()}` : 'Add exercise'}
        </Button>
      </form>
    </div>
  )
}
