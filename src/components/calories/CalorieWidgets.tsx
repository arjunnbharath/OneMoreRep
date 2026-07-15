import type { DailyMacroTotals, UserNutritionProfile } from '../../types/nutrition'

const MACRO_COLORS = {
  protein: 'bg-red-500',
  carbs: 'bg-amber-500',
  fat: 'bg-sky-500',
} as const

interface MacroBarProps {
  label: string
  current: number
  target: number
  unit?: string
  color?: keyof typeof MACRO_COLORS
}

export function MacroBar({
  label,
  current,
  target,
  unit = 'g',
  color = 'protein',
}: MacroBarProps) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0
  const over = current > target

  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className={over ? 'font-semibold text-amber-600 dark:text-amber-400' : 'text-muted'}>
          {Math.round(current)}
          {unit} / {target}
          {unit}
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface">
        <div
          className={[
            'h-full rounded-full transition-all duration-500',
            over ? 'bg-amber-500' : MACRO_COLORS[color],
          ].join(' ')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

interface CalorieRingProps {
  consumed: number
  target: number
  size?: 'md' | 'lg'
}

export function CalorieRing({ consumed, target, size = 'md' }: CalorieRingProps) {
  const remaining = Math.max(0, target - consumed)
  const over = consumed > target
  const pct = target > 0 ? Math.min(100, (consumed / target) * 100) : 0
  const radius = size === 'lg' ? 62 : 54
  const dim = size === 'lg' ? 'h-44 w-44' : 'h-36 w-36'
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference
  const center = size === 'lg' ? 70 : 60

  return (
    <div className={`relative mx-auto ${dim}`}>
      <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${center * 2} ${center * 2}`}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={size === 'lg' ? 10 : 8}
          className="text-surface"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={size === 'lg' ? 10 : 8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={[
            'transition-all duration-700',
            over ? 'text-amber-500' : 'text-foreground',
          ].join(' ')}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className={`font-semibold tabular-nums ${size === 'lg' ? 'text-3xl' : 'text-2xl'}`}>
          {over ? Math.round(consumed - target) : remaining}
        </p>
        <p className="text-[10px] uppercase tracking-wide text-muted">
          {over ? 'kcal over' : 'kcal left'}
        </p>
      </div>
    </div>
  )
}

export function StatChip({
  label,
  value,
  sub,
}: {
  label: string
  value: string | number
  sub?: string
}) {
  return (
    <div className="rounded-2xl bg-surface px-3 py-2.5 text-center ring-1 ring-border">
      <p className="text-lg font-semibold tabular-nums">{value}</p>
      <p className="text-[10px] text-muted">{label}</p>
      {sub && <p className="mt-0.5 text-[9px] text-muted">{sub}</p>}
    </div>
  )
}

export function GoalSummary({ profile }: { profile: UserNutritionProfile }) {
  const goalLabels: Record<UserNutritionProfile['goalType'], string> = {
    cut: 'Cutting',
    maintain: 'Maintaining',
    bulk: 'Bulking',
  }
  return (
    <p className="text-xs text-muted">
      {goalLabels[profile.goalType]} · {profile.dailyCalorieTarget} kcal/day
    </p>
  )
}

export function WeekStrip({
  selectedDate,
  onSelect,
  caloriesByDay,
  target,
}: {
  selectedDate: string
  onSelect: (key: string) => void
  caloriesByDay: Record<string, number>
  target: number
}) {
  const keys = getWeekKeys(selectedDate)
  const today = toLocalDateKey()

  return (
    <div className="flex gap-1">
      {keys.map((key) => {
        const [y, m, d] = key.split('-').map(Number)
        const dayLabel = new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'narrow' })
        const cals = caloriesByDay[key] ?? 0
        const pct = target > 0 ? Math.min(100, (cals / target) * 100) : 0
        const isSelected = key === selectedDate
        const isToday = key === today

        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className={[
              'flex flex-1 flex-col items-center gap-1.5 rounded-2xl py-2 transition',
              isSelected ? 'bg-foreground text-background' : 'hover:bg-surface',
            ].join(' ')}
          >
            <span
              className={[
                'text-[10px] font-medium',
                isSelected ? 'text-background/70' : 'text-muted',
              ].join(' ')}
            >
              {dayLabel}
            </span>
            <span className={`text-sm font-semibold tabular-nums ${isToday && !isSelected ? 'text-red-500' : ''}`}>
              {d}
            </span>
            <div
              className={[
                'h-1 w-6 overflow-hidden rounded-full',
                isSelected ? 'bg-background/30' : 'bg-surface',
              ].join(' ')}
            >
              <div
                className={[
                  'h-full rounded-full transition-all',
                  isSelected ? 'bg-background' : 'bg-foreground/40',
                ].join(' ')}
                style={{ width: `${pct}%` }}
              />
            </div>
          </button>
        )
      })}
    </div>
  )
}

export function WeeklyBarChart({
  caloriesByDay,
  target,
  selectedDate,
}: {
  caloriesByDay: Record<string, number>
  target: number
  selectedDate: string
}) {
  const keys = getWeekKeys(selectedDate)
  const max = Math.max(target, ...keys.map((k) => caloriesByDay[k] ?? 0), 1)

  return (
    <div className="flex h-24 items-end gap-1.5">
      {keys.map((key) => {
        const cals = caloriesByDay[key] ?? 0
        const h = Math.max(4, (cals / max) * 100)
        const isSelected = key === selectedDate
        return (
          <div key={key} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-20 w-full items-end">
              <div
                className={[
                  'w-full rounded-t-lg transition-all duration-500',
                  isSelected ? 'bg-foreground' : 'bg-foreground/25',
                ].join(' ')}
                style={{ height: `${h}%` }}
              />
            </div>
            <span className="text-[9px] tabular-nums text-muted">
              {cals > 0 ? cals : '—'}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function getWeekKeys(anchorKey: string) {
  const [y, m, d] = anchorKey.split('-').map(Number)
  const anchor = new Date(y, m - 1, d)
  const mondayOffset = (anchor.getDay() + 6) % 7
  const monday = new Date(anchor)
  monday.setDate(anchor.getDate() - mondayOffset)
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    return toLocalDateKey(date)
  })
}

function toLocalDateKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function sumByMeal(
  logs: { mealType: string; calories: number }[],
  meal: string,
) {
  return logs.filter((l) => l.mealType === meal).reduce((s, l) => s + l.calories, 0)
}

export function formatTotals(totals: DailyMacroTotals) {
  return {
    calories: Math.round(totals.calories),
    protein: Math.round(totals.protein),
    carbs: Math.round(totals.carbs),
    fat: Math.round(totals.fat),
  }
}
