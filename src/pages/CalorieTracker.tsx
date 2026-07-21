import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  Trash2,
  X,
} from 'lucide-react'
import NutritionOnboarding from '../components/calories/NutritionOnboarding'
import AddFoodPanel, { MEALS } from '../components/calories/AddFoodPanel'
import AddFoodModal, { AddFoodFab } from '../components/calories/AddFoodModal'
import Button from '../components/Button'
import {
  DailyCalorieSummary,
  sumByMeal,
  WeekStrip,
  WeeklyCalorieSection,
} from '../components/calories/CalorieWidgets'
import { toLocalDateKey } from '../lib/nutritionMath'
import { CalorieTrackerProvider, useCalorieTrackerContext } from '../context/CalorieTrackerContext'
import type {
  ActivityLevel,
  GoalType,
  MealType,
  UserNutritionProfile,
} from '../types/nutrition'

const ACTIVITY_OPTIONS: { id: ActivityLevel; label: string; desc: string }[] = [
  { id: 'sedentary', label: 'Sedentary', desc: 'Desk job, little exercise' },
  { id: 'lightly_active', label: 'Light', desc: '1–3 workouts per week' },
  { id: 'moderately_active', label: 'Moderate', desc: '3–5 workouts per week' },
  { id: 'very_active', label: 'Very active', desc: '6–7 workouts per week' },
  { id: 'extra_active', label: 'Athlete', desc: 'Physical job + training' },
]

const GOAL_OPTIONS: { id: GoalType; label: string; desc: string }[] = [
  { id: 'cut', label: 'Cut', desc: 'Lose weight · −500 kcal' },
  { id: 'maintain', label: 'Maintain', desc: 'Stay at current weight' },
  { id: 'bulk', label: 'Bulk', desc: 'Build muscle · +400 kcal' },
]

function shiftDateKey(key: string, days: number) {
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + days)
  return toLocalDateKey(date)
}

function formatDisplayDate(key: string) {
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const today = toLocalDateKey()
  if (key === today) return 'Today'
  const yesterday = shiftDateKey(today, -1)
  if (key === yesterday) return 'Yesterday'
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

function SettingsPanel({
  profile,
  onClose,
}: {
  profile: UserNutritionProfile
  onClose: () => void
}) {
  const { setupProfile } = useCalorieTrackerContext()
  const [age, setAge] = useState(String(profile.age))
  const [weightKg, setWeightKg] = useState(String(profile.weightKg))
  const [activity, setActivity] = useState(profile.activityLevel)
  const [goal, setGoal] = useState(profile.goalType)

  function handleSave(e: FormEvent) {
    e.preventDefault()
    setupProfile({
      age: Number(age),
      sex: profile.sex,
      heightCm: profile.heightCm,
      weightKg: Number(weightKg),
      activityLevel: activity,
      goalType: goal,
    })
    onClose()
  }

  return (
    <div className="pb-modal-mobile fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-3xl bg-background p-6 ring-1 ring-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Edit targets</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">
              <span className="text-muted">Age</span>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="mt-1 w-full rounded-xl bg-surface px-3 py-2.5 ring-1 ring-border"
              />
            </label>
            <label className="text-sm">
              <span className="text-muted">Weight (kg)</span>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="mt-1 w-full rounded-xl bg-surface px-3 py-2.5 ring-1 ring-border"
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="text-muted">Activity</span>
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value as ActivityLevel)}
              className="mt-1 w-full rounded-xl bg-surface px-3 py-2.5 ring-1 ring-border"
            >
              {ACTIVITY_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-muted">Goal</span>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as GoalType)}
              className="mt-1 w-full rounded-xl bg-surface px-3 py-2.5 ring-1 ring-border"
            >
              {GOAL_OPTIONS.map((g) => (
                <option key={g.id} value={g.id}>{g.label}</option>
              ))}
            </select>
          </label>
          <Button type="submit" className="w-full py-3">
            Save changes
          </Button>
        </form>
      </div>
    </div>
  )
}

function DailyLog() {
  const {
    profile,
    dayLogs,
    dayTotals,
    caloriesByDay,
    selectedDate,
    setSelectedDate,
    removeLog,
  } = useCalorieTrackerContext()

  const [showAdd, setShowAdd] = useState(false)
  const [addMeal, setAddMeal] = useState<MealType>('lunch')
  const [showSettings, setShowSettings] = useState(false)
  const [expandedMeal, setExpandedMeal] = useState<MealType | null>('breakfast')

  if (!profile) return null

  const isToday = selectedDate === toLocalDateKey()

  function openAdd(meal: MealType) {
    setAddMeal(meal)
    setShowAdd(true)
  }

  return (
    <div className="min-h-full bg-background">
      <header className="hidden border-b border-border lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-10 py-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
              Nutrition
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Calorie tracker</h1>
          </div>
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            aria-label="Settings"
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface ring-1 ring-border transition hover:ring-foreground/20"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10 lg:px-10 lg:py-8">
        <div className="px-5 py-6 lg:px-0 lg:py-0">
          <header className="flex items-start justify-between lg:hidden">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                Nutrition
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                {formatDisplayDate(selectedDate)}
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              aria-label="Settings"
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface ring-1 ring-border transition hover:ring-foreground/20"
            >
              <Settings size={18} />
            </button>
          </header>

          <p className="mt-1 hidden text-2xl font-semibold tracking-tight lg:block">
            {formatDisplayDate(selectedDate)}
          </p>

          <div className="mt-5 lg:mt-6">
            <WeekStrip
              selectedDate={selectedDate}
              onSelect={setSelectedDate}
              caloriesByDay={caloriesByDay}
              target={profile.dailyCalorieTarget}
            />
          </div>

          {!isToday && (
            <button
              type="button"
              onClick={() => setSelectedDate(toLocalDateKey())}
              className="mt-3 text-xs font-medium text-muted hover:text-foreground"
            >
              Jump to today
            </button>
          )}

          <div className="mt-6 lg:hidden" data-tour="calorie-summary">
            <DailyCalorieSummary
              consumed={dayTotals.calories}
              target={profile.dailyCalorieTarget}
              protein={dayTotals.protein}
              proteinTarget={profile.proteinTargetG}
              carbs={dayTotals.carbs}
              carbsTarget={profile.carbsTargetG}
              fat={dayTotals.fat}
              fatTarget={profile.fatTargetG}
            />
          </div>

          <div className="mt-6 lg:hidden">
            <WeeklyCalorieSection
              caloriesByDay={caloriesByDay}
              target={profile.dailyCalorieTarget}
              selectedDate={selectedDate}
            />
          </div>

          <div className="mt-6 flex items-center justify-between lg:mt-8">
            <h2 className="text-lg font-semibold">Meals</h2>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setSelectedDate(shiftDateKey(selectedDate, -1))}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface ring-1 ring-border"
                aria-label="Previous day"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => setSelectedDate(shiftDateKey(selectedDate, 1))}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface ring-1 ring-border"
                aria-label="Next day"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-3 pb-4 lg:pb-8">
            {MEALS.map((meal) => {
              const Icon = meal.icon
              const mealLogs = dayLogs.filter((l) => l.mealType === meal.id)
              const mealCals = sumByMeal(dayLogs, meal.id)
              const isOpen = expandedMeal === meal.id

              return (
                <section
                  key={meal.id}
                  className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedMeal(isOpen ? null : meal.id)}
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-background ring-1 ring-border">
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{meal.label}</p>
                      <p className="text-xs text-muted">
                        {mealLogs.length === 0
                          ? 'Nothing logged'
                          : `${mealLogs.length} item${mealLogs.length === 1 ? '' : 's'}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums">{mealCals}</p>
                      <p className="text-[10px] text-muted">kcal</p>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-border px-4 pb-4">
                      {mealLogs.length === 0 ? (
                        <p className="py-4 text-center text-xs text-muted">
                          Tap + to add {meal.label.toLowerCase()}
                        </p>
                      ) : (
                        <ul className="space-y-2 pt-3">
                          {mealLogs.map((entry) => (
                            <li
                              key={entry.id}
                              className="flex items-center justify-between rounded-xl bg-background px-3 py-2.5 ring-1 ring-border"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">{entry.name}</p>
                                <p className="text-xs text-muted">
                                  {entry.quantityGrams}g · P {entry.protein}g · C {entry.carbs}g · F {entry.fat}g
                                </p>
                              </div>
                              <div className="flex items-center gap-3 pl-2">
                                <span className="text-sm font-semibold tabular-nums">{entry.calories}</span>
                                <button
                                  type="button"
                                  onClick={() => removeLog(entry.id)}
                                  aria-label="Remove"
                                  className="text-muted hover:text-red-500"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                      <button
                        type="button"
                        onClick={() => openAdd(meal.id)}
                        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-medium text-muted ring-1 ring-dashed ring-border transition hover:text-foreground"
                      >
                        <Plus size={14} />
                        Add to {meal.label.toLowerCase()}
                      </button>
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-8 space-y-6">
            <div data-tour="calorie-summary">
            <DailyCalorieSummary
              consumed={dayTotals.calories}
              target={profile.dailyCalorieTarget}
              protein={dayTotals.protein}
              proteinTarget={profile.proteinTargetG}
              carbs={dayTotals.carbs}
              carbsTarget={profile.carbsTargetG}
              fat={dayTotals.fat}
              fatTarget={profile.fatTargetG}
            />
            </div>

            <WeeklyCalorieSection
              caloriesByDay={caloriesByDay}
              target={profile.dailyCalorieTarget}
              selectedDate={selectedDate}
            />

            <AddFoodPanel
              onClose={() => {}}
              dateKey={selectedDate}
              defaultMeal={addMeal}
              variant="embedded"
            />
          </div>
        </aside>
      </div>

      <AddFoodFab onClick={() => openAdd(addMeal)} hidden={showAdd} />

      <AddFoodModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        dateKey={selectedDate}
        defaultMeal={addMeal}
      />

      {showSettings && profile && (
        <SettingsPanel profile={profile} onClose={() => setShowSettings(false)} />
      )}
    </div>
  )
}

export default function CalorieTracker() {
  const { profile, ready } = useCalorieTrackerContext()

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted">
        Loading your nutrition data…
      </div>
    )
  }

  if (!profile?.onboarded) {
    return <NutritionOnboarding />
  }

  return <DailyLog />
}

export function CalorieTrackerPage() {
  return (
    <CalorieTrackerProvider>
      <CalorieTracker />
    </CalorieTrackerProvider>
  )
}
