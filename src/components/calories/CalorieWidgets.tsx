import type { DailyMacroTotals, UserNutritionProfile } from '../../types/nutrition'

const CALORIES_SUMMARY_BG = '/images/gym_background/calories.jpg'
const WEEK_CALORIES_BG = '/images/gym_background/week-calaores.jpg'

const MACRO_COLORS = {
  protein: {
    bar: 'bg-red-500',
    track: 'bg-red-500/15',
    dot: 'bg-red-500',
  },
  carbs: {
    bar: 'bg-amber-500',
    track: 'bg-amber-500/15',
    dot: 'bg-amber-500',
  },
  fat: {
    bar: 'bg-sky-500',
    track: 'bg-sky-500/15',
    dot: 'bg-sky-500',
  },
} as const

interface MacroColumnProps {
  label: string
  current: number
  target: number
  color: keyof typeof MACRO_COLORS
  onImage?: boolean
}

function MacroColumn({ label, current, target, color, onImage = false }: MacroColumnProps) {
  const eaten = Math.round(current)
  const goal = Math.round(target)
  const pct = goal > 0 ? Math.min(100, (current / goal) * 100) : 0
  const over = current > target
  const palette = MACRO_COLORS[color]

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5">
        <span className={`h-2 w-2 shrink-0 rounded-full ${palette.dot}`} />
        <span className={['truncate text-[11px] font-medium', onImage ? 'text-white/70' : 'text-muted'].join(' ')}>
          {label}
        </span>
      </div>
      <p className="mt-2 text-xl font-semibold tabular-nums leading-none">
        {eaten}
        <span className={['ml-0.5 text-sm font-normal', onImage ? 'text-white/60' : 'text-muted'].join(' ')}>g</span>
      </p>
      <div className={`mt-2.5 h-1.5 overflow-hidden rounded-full ${onImage ? 'bg-white/20' : palette.track}`}>
        <div
          className={[
            'h-full rounded-full transition-all duration-500',
            over ? 'bg-amber-500' : palette.bar,
          ].join(' ')}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={['mt-1.5 text-[10px] tabular-nums', onImage ? 'text-white/60' : 'text-muted'].join(' ')}>of {goal}g</p>
    </div>
  )
}

interface DailyCalorieSummaryProps {
  consumed: number
  target: number
  protein: number
  proteinTarget: number
  carbs: number
  carbsTarget: number
  fat: number
  fatTarget: number
}

export function DailyCalorieSummary({
  consumed,
  target,
  protein,
  proteinTarget,
  carbs,
  carbsTarget,
  fat,
  fatTarget,
}: DailyCalorieSummaryProps) {
  const eaten = Math.round(consumed)
  const goal = Math.round(target)
  const over = eaten > goal
  const remaining = Math.max(0, goal - eaten)
  const pct = goal > 0 ? Math.min(100, (eaten / goal) * 100) : 0

  return (
    <div className="relative overflow-hidden rounded-3xl ring-1 ring-border">
      <img
        src={CALORIES_SUMMARY_BG}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/60 to-black/80" />
      <div className="relative p-5 text-white lg:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
            {over ? 'Over budget' : 'Remaining'}
          </p>
          <p
            className={[
              'mt-1 text-4xl font-bold tabular-nums tracking-tight sm:text-[2.75rem]',
              over ? 'text-amber-300' : '',
            ].join(' ')}
          >
            {over ? eaten - goal : remaining}
          </p>
          <p className="mt-0.5 text-sm text-white/65">kcal</p>
        </div>

        <div className="shrink-0 rounded-2xl bg-white/10 px-4 py-3 text-right ring-1 ring-white/15 backdrop-blur-sm">
          <p className="text-2xl font-semibold tabular-nums leading-none">{eaten}</p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-white/65">
            Eaten
          </p>
          <div className="my-2 h-px bg-white/15" />
          <p className="text-sm font-semibold tabular-nums leading-none">{goal}</p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-white/65">
            Goal
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between text-xs text-white/65">
          <span>{eaten} kcal eaten</span>
          <span>{goal} kcal goal</span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/20">
          <div
            className={[
              'h-full rounded-full transition-all duration-700',
              over ? 'bg-amber-400' : 'bg-white',
            ].join(' ')}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-center text-[11px] tabular-nums text-white/60">
          {Math.round(pct)}% of daily goal
        </p>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/15 pt-5">
        <MacroColumn label="Protein" current={protein} target={proteinTarget} color="protein" onImage />
        <MacroColumn label="Carbs" current={carbs} target={carbsTarget} color="carbs" onImage />
        <MacroColumn label="Fat" current={fat} target={fatTarget} color="fat" onImage />
      </div>
      </div>
    </div>
  )
}

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
            over ? 'bg-amber-500' : MACRO_COLORS[color].bar,
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
  onImage = false,
}: {
  caloriesByDay: Record<string, number>
  target: number
  selectedDate: string
  onImage?: boolean
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
                  isSelected
                    ? onImage
                      ? 'bg-white'
                      : 'bg-foreground'
                    : onImage
                      ? 'bg-white/35'
                      : 'bg-foreground/25',
                ].join(' ')}
                style={{ height: `${h}%` }}
              />
            </div>
            <span className={['text-[9px] tabular-nums', onImage ? 'text-white/65' : 'text-muted'].join(' ')}>
              {cals > 0 ? cals : '—'}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function WeeklyCalorieSection({
  caloriesByDay,
  target,
  selectedDate,
}: {
  caloriesByDay: Record<string, number>
  target: number
  selectedDate: string
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl ring-1 ring-border">
      <img
        src={WEEK_CALORIES_BG}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/60 to-black/80" />
      <div className="relative p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">This week</h2>
          <span className="text-xs text-white/65">{target} kcal goal</span>
        </div>
        <div className="mt-4">
          <WeeklyBarChart
            caloriesByDay={caloriesByDay}
            target={target}
            selectedDate={selectedDate}
            onImage
          />
        </div>
      </div>
    </section>
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
