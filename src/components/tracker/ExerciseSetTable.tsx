import { Check, Plus, X } from 'lucide-react'
import type { TrackedExercise, WorkoutSet } from '../../types/tracker'

function previousForSet(lastExercise: TrackedExercise | null, setIndex: number) {
  const last = lastExercise?.sets[setIndex]
  if (!last) return null
  if (last.weight) return `${last.weight} kg Ã— ${last.reps}`
  return `${last.reps} reps`
}

interface ExerciseSetTableProps {
  exercise: TrackedExercise
  lastLog?: TrackedExercise | null
  onUpdateSet: (setId: string, reps: number, weight?: number) => void
  onUpdateRir?: (setId: string, rir?: number) => void
  onToggleComplete: (setId: string, completed: boolean) => void
  onRemoveSet: (setId: string) => void
  onAddSet: () => void
}

const GRID = 'grid grid-cols-[2rem_minmax(0,1fr)_minmax(0,1fr)_2.75rem_3rem_1.75rem] items-center gap-2'

function SetRow({
  set,
  setIndex,
  previous,
  ghostWeight,
  onUpdateSet,
  onUpdateRir,
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
  onUpdateRir?: (rir?: number) => void
  onToggleComplete: (completed: boolean) => void
  onRemoveSet: () => void
}) {
  const done = !!set.completed
  const field = [
    'no-spinner h-12 w-full rounded-2xl text-center text-base font-medium tabular-nums outline-none transition',
    done
      ? 'bg-transparent text-foreground'
      : 'bg-background text-foreground focus:ring-2 focus:ring-foreground/40',
  ].join(' ')

  return (
    <div
      className={[
        'rounded-[1.25rem] px-2 py-1.5 transition-colors',
        done ? 'bg-emerald-500/10' : '',
      ].join(' ')}
    >
      <div className={GRID}>
        <span
          className={[
            'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium tabular-nums',
            done ? 'bg-emerald-500 text-white' : 'bg-foreground/[0.07] text-foreground',
          ].join(' ')}
        >
          {setIndex + 1}
        </span>

        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={0.5}
          value={set.weight ?? ''}
          placeholder={ghostWeight !== undefined ? String(ghostWeight) : '0'}
          aria-label={`Set ${setIndex + 1} weight in kg`}
          onChange={(e) =>
            onUpdateSet(
              parseInt(String(set.reps), 10) || 1,
              e.target.value ? parseFloat(e.target.value) : undefined,
            )
          }
          className={field}
        />

        <input
          type="number"
          inputMode="numeric"
          min={1}
          value={set.reps}
          aria-label={`Set ${setIndex + 1} reps`}
          onChange={(e) => onUpdateSet(parseInt(e.target.value, 10) || 1, set.weight)}
          className={field}
        />

        <input
          type="number"
          inputMode="decimal"
          min={0}
          max={10}
          step={0.5}
          value={set.rir ?? ''}
          placeholder="–"
          aria-label={`Set ${setIndex + 1} reps in reserve`}
          onChange={(e) =>
            onUpdateRir?.(e.target.value === '' ? undefined : parseFloat(e.target.value))
          }
          className={field}
        />

        <button
          type="button"
          onClick={() => onToggleComplete(done)}
          data-tour={setIndex === 0 ? 'set-complete-btn' : undefined}
          aria-label={done ? 'Undo set' : 'Complete set'}
          className={[
            'flex h-12 w-12 items-center justify-center rounded-full transition active:scale-95',
            done ? 'bg-emerald-500 text-white' : 'bg-foreground/[0.07] text-muted',
          ].join(' ')}
        >
          <Check size={20} strokeWidth={2.5} />
        </button>

        {canRemove ? (
          <button
            type="button"
            onClick={onRemoveSet}
            aria-label={`Delete set ${setIndex + 1}`}
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition active:bg-red-500/10 active:text-red-500"
          >
            <X size={16} />
          </button>
        ) : (
          <span />
        )}
      </div>

      {previous && !done && (
        <p className="pl-10 pt-1 text-xs text-muted">Last time {previous}</p>
      )}
    </div>
  )
}

export default function ExerciseSetTable({
  exercise,
  lastLog = null,
  onUpdateSet,
  onUpdateRir,
  onToggleComplete,
  onRemoveSet,
  onAddSet,
}: ExerciseSetTableProps) {
  const canRemoveSet = exercise.sets.length > 1

  return (
    <div className="mt-3">
      <div className={`${GRID} px-2 pb-1 text-xs font-medium text-muted`}>
        <span className="text-center">Set</span>
        <span className="text-center">kg</span>
        <span className="text-center">Reps</span>
        <span className="text-center">RIR</span>
        <span />
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
              onUpdateRir={(rir) => onUpdateRir?.(set.id, rir)}
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
        className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground/[0.07] text-sm font-medium text-foreground transition active:bg-foreground/[0.12]"
      >
        <Plus size={18} />
        Add set
      </button>
    </div>
  )
}
