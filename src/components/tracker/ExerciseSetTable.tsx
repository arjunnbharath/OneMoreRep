import { Check, Minus, Plus } from 'lucide-react'
import type { TrackedExercise, WorkoutSet } from '../../types/tracker'

function previousForSet(lastExercise: TrackedExercise | null, setIndex: number) {
  const last = lastExercise?.sets[setIndex]
  if (!last) return null
  if (last.weight) return `${last.weight}×${last.reps}`
  return `${last.reps}`
}

interface ExerciseSetTableProps {
  exercise: TrackedExercise
  lastLog?: TrackedExercise | null
  onUpdateSet: (setId: string, reps: number, weight?: number) => void
  onToggleComplete: (setId: string, completed: boolean) => void
  onRemoveSet: (setId: string) => void
  onAddSet: () => void
}

function SetRow({
  set,
  setIndex,
  previous,
  ghostWeight,
  onUpdateSet,
  onToggleComplete,
  onRemoveSet,
  canRemove,
}: {
  set: WorkoutSet
  setIndex: number
  previous: string | null
  ghostWeight?: number
  canRemove: boolean
  onUpdateSet: (reps: number, weight?: number) => void
  onToggleComplete: (completed: boolean) => void
  onRemoveSet: () => void
}) {
  const done = !!set.completed

  return (
    <div
      className={[
        'grid grid-cols-[28px_52px_1fr_52px_36px_28px] items-center gap-2 rounded-xl px-1 py-1',
        done ? 'bg-foreground/5 dark:bg-white/[0.04]' : '',
      ].join(' ')}
    >
      <span className="text-center text-sm font-medium text-muted">{setIndex + 1}</span>

      <span className="truncate text-center text-xs text-muted">{previous ?? '—'}</span>

      <input
        type="number"
        inputMode="decimal"
        min={0}
        step={0.5}
        value={set.weight ?? ''}
        placeholder={ghostWeight !== undefined ? String(ghostWeight) : '0'}
        onChange={(e) =>
          onUpdateSet(
            parseInt(String(set.reps), 10) || 1,
            e.target.value ? parseFloat(e.target.value) : undefined,
          )
        }
        className="no-spinner w-full rounded-lg bg-surface-elevated px-2 py-2.5 text-center text-sm font-medium outline-none ring-1 ring-border focus:ring-foreground/30 dark:ring-white/10 dark:focus:ring-white/20"
      />

      <input
        type="number"
        inputMode="numeric"
        min={1}
        value={set.reps}
        onChange={(e) => onUpdateSet(parseInt(e.target.value, 10) || 1, set.weight)}
        className="no-spinner w-full rounded-lg bg-surface-elevated px-2 py-2.5 text-center text-sm font-medium outline-none ring-1 ring-border focus:ring-foreground/30 dark:ring-white/10 dark:focus:ring-white/20"
      />

      <button
        type="button"
        onClick={() => onToggleComplete(done)}
        data-tour={setIndex === 0 ? 'set-complete-btn' : undefined}
        aria-label={done ? 'Undo set' : 'Complete set'}
        className={[
          'mx-auto flex h-9 w-9 items-center justify-center rounded-full transition active:scale-95',
          done
            ? 'bg-foreground text-background shadow-sm'
            : 'bg-surface-elevated ring-1 ring-border text-muted dark:ring-white/8',
        ].join(' ')}
      >
        <Check size={16} strokeWidth={2.5} />
      </button>

      {canRemove ? (
        <button
          type="button"
          onClick={onRemoveSet}
          aria-label={`Delete set ${setIndex + 1}`}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted transition hover:bg-red-500/10 hover:text-red-500"
        >
          <Minus size={14} />
        </button>
      ) : (
        <span />
      )}
    </div>
  )
}

export default function ExerciseSetTable({
  exercise,
  lastLog = null,
  onUpdateSet,
  onToggleComplete,
  onRemoveSet,
  onAddSet,
}: ExerciseSetTableProps) {
  const canRemoveSet = exercise.sets.length > 1

  return (
    <div className="mt-3">
      <div className="mb-1 grid grid-cols-[28px_52px_1fr_52px_36px_28px] gap-2 px-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
        <span className="text-center">Set</span>
        <span className="text-center">Last</span>
        <span className="text-center">kg</span>
        <span className="text-center">Reps</span>
        <span />
      </div>

      <div className="space-y-1">
        {exercise.sets.map((set, setIndex) => {
          const last = lastLog?.sets[setIndex]
          return (
            <SetRow
              key={set.id}
              set={set}
              setIndex={setIndex}
              previous={previousForSet(lastLog ?? null, setIndex)}
              ghostWeight={last?.weight}
              onUpdateSet={(reps, weight) => onUpdateSet(set.id, reps, weight)}
              onToggleComplete={(completed) => onToggleComplete(set.id, completed)}
              onRemoveSet={() => onRemoveSet(set.id)}
              canRemove={canRemoveSet}
            />
          )
        })}
      </div>

      <button
        type="button"
        onClick={onAddSet}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-surface-elevated py-2.5 text-sm font-medium text-muted ring-1 ring-border transition hover:text-foreground dark:ring-white/8"
      >
        <Plus size={15} />
        Add set
      </button>
    </div>
  )
}
