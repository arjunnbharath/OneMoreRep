import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Apple, Check, ChevronRight, Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { useCalorieTrackerContext } from '../../context/CalorieTrackerContext'
import {
  calculateBmr,
  calculateCalorieTarget,
  calculateMacroTargets,
  calculateTdee,
} from '../../lib/nutritionMath'
import type { ActivityLevel, GoalType, Sex } from '../../types/nutrition'

const ONBOARDING_BG = '/images/gym_background/nutri setup.jpg'

const ACTIVITY_OPTIONS: { id: ActivityLevel; label: string; hint: string }[] = [
  { id: 'sedentary', label: 'Sedentary', hint: 'Desk job, little exercise' },
  { id: 'lightly_active', label: 'Light', hint: '1–3 workouts per week' },
  { id: 'moderately_active', label: 'Moderate', hint: '3–5 workouts per week' },
  { id: 'very_active', label: 'Very active', hint: '6–7 workouts per week' },
  { id: 'extra_active', label: 'Athlete', hint: 'Physical job plus training' },
]

const GOAL_OPTIONS: {
  id: GoalType
  label: string
  hint: string
  icon: typeof TrendingDown
}[] = [
  { id: 'cut', label: 'Cut', hint: 'Lose weight', icon: TrendingDown },
  { id: 'maintain', label: 'Maintain', hint: 'Stay at current weight', icon: Minus },
  { id: 'bulk', label: 'Bulk', hint: 'Build muscle', icon: TrendingUp },
]

function SelectCard({
  selected,
  onClick,
  children,
  hint,
}: {
  selected: boolean
  onClick: () => void
  children: ReactNode
  hint?: string
}) {
  return (
    <button type="button" onClick={onClick} className="w-full text-left">
      <div
        className={[
          'rounded-2xl px-4 py-3.5 transition',
          selected ? 'nutrition-choice nutrition-choice-selected' : 'nutrition-choice',
        ].join(' ')}
      >
        <span className="block text-sm font-medium">{children}</span>
        {hint && <span className="nutrition-hint mt-0.5 block text-xs text-muted">{hint}</span>}
      </div>
    </button>
  )
}

function GoalCard({
  label,
  hint,
  icon: Icon,
  selected,
  onClick,
}: {
  label: string
  hint: string
  icon: typeof TrendingDown
  selected: boolean
  onClick: () => void
}) {
  return (
    <button type="button" onClick={onClick} className="w-full text-left">
      <div
        className={[
          'flex items-center gap-3 rounded-2xl px-4 py-3.5 transition',
          selected ? 'nutrition-choice nutrition-choice-selected' : 'nutrition-choice',
        ].join(' ')}
      >
        <div className="nutrition-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-elevated text-muted ring-1 ring-border">
          <Icon size={17} strokeWidth={2.25} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug">{label}</p>
          <p className="nutrition-hint mt-0.5 text-xs text-muted">{hint}</p>
        </div>
        <div
          className={[
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
            selected
              ? 'border-white bg-white dark:border-foreground dark:bg-foreground'
              : 'border-border dark:border-border',
          ].join(' ')}
        >
          {selected && (
            <Check size={11} className="text-foreground dark:text-background" strokeWidth={3} />
          )}
        </div>
      </div>
    </button>
  )
}

export default function NutritionOnboarding() {
  const { setupProfile } = useCalorieTrackerContext()
  const [step, setStep] = useState(0)
  const [age, setAge] = useState('25')
  const [sex, setSex] = useState<Sex>('male')
  const [heightCm, setHeightCm] = useState('175')
  const [weightKg, setWeightKg] = useState('75')
  const [activity, setActivity] = useState<ActivityLevel>('moderately_active')
  const [goal, setGoal] = useState<GoalType>('maintain')
  const [calorieInput, setCalorieInput] = useState('')
  const [caloriesTouched, setCaloriesTouched] = useState(false)

  const stats = useMemo(() => {
    const a = Number(age)
    const h = Number(heightCm)
    const w = Number(weightKg)
    if (!a || !h || !w) return null
    const bmr = calculateBmr(sex, w, h, a)
    const tdee = calculateTdee(bmr, activity)
    const { target, warning } = calculateCalorieTarget(tdee, goal, sex)
    return { bmr: Math.round(bmr), tdee: Math.round(tdee), target, warning }
  }, [age, sex, heightCm, weightKg, activity, goal])

  useEffect(() => {
    if (!stats || caloriesTouched) return
    setCalorieInput(String(stats.target))
  }, [stats, caloriesTouched])

  const calorieTarget = Number(calorieInput)
  const macros = useMemo(() => {
    const w = Number(weightKg)
    if (!calorieTarget || !w) return null
    return calculateMacroTargets(calorieTarget, w)
  }, [calorieTarget, weightKg])

  const step0Valid =
    Number(age) >= 14 &&
    Number(age) <= 100 &&
    Number(heightCm) >= 100 &&
    Number(heightCm) <= 250 &&
    Number(weightKg) >= 30 &&
    Number(weightKg) <= 300

  const step2Valid = calorieTarget >= 1000 && calorieTarget <= 6000

  const canContinue =
    (step === 0 && step0Valid) ||
    (step === 1 && activity !== null) ||
    (step === 2 && step2Valid)

  function handleComplete() {
    if (!step0Valid || !step2Valid) return
    setupProfile({
      age: Number(age),
      sex,
      heightCm: Number(heightCm),
      weightKg: Number(weightKg),
      activityLevel: activity,
      goalType: goal,
      dailyCalorieTarget: calorieTarget,
    })
  }

  function handleNext() {
    if (step < 2) {
      setStep((s) => s + 1)
      return
    }
    handleComplete()
  }

  return (
    <div className="px-5 pb-8 pt-14 lg:px-10 lg:pt-8">
      <div className="mx-auto max-w-lg py-2 lg:max-w-xl">
        <div className="onboarding-card overflow-hidden rounded-3xl ring-1 ring-border">
          <div className="relative h-44 lg:h-52">
            <img
              src={ONBOARDING_BG}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="onboarding-hero-overlay pointer-events-none absolute inset-0" />
            <div className="absolute inset-0 flex items-end p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
                  <Apple size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white drop-shadow-sm">
                    Nutrition setup
                  </h2>
                  <p className="text-xs text-white/80 drop-shadow-sm">
                    Step {step + 1} of 3 · daily calorie target
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="onboarding-body px-5 pb-5 pt-4">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={[
                    'h-1 flex-1 rounded-full transition',
                    i <= step ? 'bg-foreground' : 'bg-border',
                  ].join(' ')}
                />
              ))}
            </div>

            <div className="mt-5 flex min-h-[300px] flex-col lg:min-h-[320px]">
              {step === 0 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted">What&apos;s your sex, age, height and weight?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(['male', 'female'] as const).map((option) => (
                      <SelectCard
                        key={option}
                        selected={sex === option}
                        onClick={() => setSex(option)}
                      >
                        <span className="capitalize">{option}</span>
                      </SelectCard>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Age', value: age, set: setAge, min: 14, max: 100 },
                      { label: 'Height', value: heightCm, set: setHeightCm, min: 100, max: 250 },
                      { label: 'Weight', value: weightKg, set: setWeightKg, min: 30, max: 300 },
                    ].map((field) => (
                      <label key={field.label} className="text-sm">
                        <span className="text-xs text-muted">{field.label}</span>
                        <input
                          type="number"
                          min={field.min}
                          max={field.max}
                          value={field.value}
                          onChange={(e) => field.set(e.target.value)}
                          className="nutrition-field mt-1 w-full rounded-xl px-3 py-2.5 text-sm font-medium tabular-nums outline-none"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted">How active are you in a typical week?</p>
                  <div className="space-y-2">
                    {ACTIVITY_OPTIONS.map((option) => (
                      <SelectCard
                        key={option.id}
                        selected={activity === option.id}
                        onClick={() => setActivity(option.id)}
                        hint={option.hint}
                      >
                        {option.label}
                      </SelectCard>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted">What&apos;s your goal?</p>
                  <div className="space-y-2">
                    {GOAL_OPTIONS.map((option) => (
                      <GoalCard
                        key={option.id}
                        label={option.label}
                        hint={option.hint}
                        icon={option.icon}
                        selected={goal === option.id}
                        onClick={() => setGoal(option.id)}
                      />
                    ))}
                  </div>

                  <div className="nutrition-panel rounded-2xl px-4 py-4">
                    <p className="text-xs font-medium text-muted">Daily calories</p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <input
                        type="number"
                        min={1000}
                        max={6000}
                        step={50}
                        value={calorieInput}
                        onChange={(e) => {
                          setCaloriesTouched(true)
                          setCalorieInput(e.target.value)
                        }}
                        className="w-full bg-transparent text-3xl font-semibold tabular-nums tracking-tight outline-none"
                      />
                      <span className="shrink-0 text-sm text-muted">kcal</span>
                    </div>
                    {stats && !caloriesTouched && (
                      <p className="mt-2 text-xs text-muted">
                        Suggested {stats.target} · BMR {stats.bmr} · TDEE {stats.tdee}
                      </p>
                    )}
                    {stats?.warning && (
                      <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                        {stats.warning}
                      </p>
                    )}
                    {macros && (
                      <p className="mt-3 border-t border-border pt-3 text-xs text-muted">
                        Protein {macros.protein}g · Carbs {macros.carbs}g · Fat {macros.fat}g
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-auto flex items-center gap-3 pt-5">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="rounded-xl px-3 py-2.5 text-sm text-muted transition hover:text-foreground"
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canContinue}
                  className={[
                    'flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background transition disabled:opacity-40',
                    step === 0 ? 'ml-auto w-full justify-center' : 'ml-auto',
                  ].join(' ')}
                >
                  {step === 2 ? 'Start tracking' : 'Continue'}
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
