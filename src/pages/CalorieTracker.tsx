import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Apple,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Cookie,
  Moon,
  Plus,
  ScanBarcode,
  Search,
  Settings,
  Sun,
  Trash2,
  X,
} from 'lucide-react'
import NutritionOnboarding from '../components/calories/NutritionOnboarding'
import BarcodeScanner from '../components/calories/BarcodeScanner'
import Button from '../components/Button'
import {
  DailyCalorieSummary,
  sumByMeal,
  WeekStrip,
  WeeklyCalorieSection,
} from '../components/calories/CalorieWidgets'
import {
  macrosForGrams,
  toLocalDateKey,
} from '../lib/nutritionMath'
import { CalorieTrackerProvider, useCalorieTrackerContext } from '../context/CalorieTrackerContext'
import type {
  ActivityLevel,
  FoodItem,
  GoalType,
  MealType,
  UserNutritionProfile,
} from '../types/nutrition'

const MEALS: { id: MealType; label: string; icon: typeof Coffee }[] = [
  { id: 'breakfast', label: 'Breakfast', icon: Coffee },
  { id: 'lunch', label: 'Lunch', icon: Sun },
  { id: 'dinner', label: 'Dinner', icon: Moon },
  { id: 'snack', label: 'Snacks', icon: Cookie },
]

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

const SERVING_PRESETS = [50, 100, 150, 200]

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

function AddFoodPanel({
  onClose,
  dateKey,
  defaultMeal,
}: {
  onClose: () => void
  dateKey: string
  defaultMeal?: MealType
}) {
  const { logFood, searchFoods, recentFoods, addCustomFood, lookupFoodByBarcode } =
    useCalorieTrackerContext()
  const [tab, setTab] = useState<'search' | 'recent' | 'custom' | 'scan'>('search')
  const [query, setQuery] = useState('')
  const [mealType, setMealType] = useState<MealType>(defaultMeal ?? 'lunch')
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [grams, setGrams] = useState('100')
  const [customName, setCustomName] = useState('')
  const [customCal, setCustomCal] = useState('')
  const [customProtein, setCustomProtein] = useState('')
  const [customCarbs, setCustomCarbs] = useState('')
  const [customFat, setCustomFat] = useState('')

  const results = useMemo(() => searchFoods(query), [query, searchFoods])
  const preview = selectedFood ? macrosForGrams(selectedFood, Number(grams) || 0) : null

  function handleLog(food: FoodItem, quantity: number) {
    if (quantity <= 0) return
    logFood({ food, mealType, quantityGrams: quantity, dateKey })
    onClose()
  }

  function handleCustomSubmit(e: FormEvent) {
    e.preventDefault()
    const food = addCustomFood({
      name: customName.trim(),
      caloriesPer100g: Number(customCal),
      proteinPer100g: Number(customProtein),
      carbsPer100g: Number(customCarbs),
      fatPer100g: Number(customFat),
    })
    handleLog(food, 100)
  }

  const tabLabels: Record<typeof tab, string> = {
    search: 'Search',
    recent: 'Recent',
    custom: 'Custom',
    scan: 'Scan',
  }

  return (
    <div className="flex h-full max-h-[85dvh] flex-col rounded-t-3xl bg-background lg:max-h-none lg:rounded-2xl lg:ring-1 lg:ring-border">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h3 className="font-semibold">Add food</h3>
          <p className="text-xs text-muted">Log to {MEALS.find((m) => m.id === mealType)?.label}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex gap-1 border-b border-border p-2">
        {(['search', 'recent', 'scan', 'custom'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={[
              'flex flex-1 items-center justify-center gap-1 rounded-xl py-2 text-xs font-medium transition',
              tab === t ? 'bg-foreground text-background' : 'text-muted hover:bg-surface',
            ].join(' ')}
          >
            {t === 'scan' && <ScanBarcode size={12} />}
            {tabLabels[t]}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4 flex flex-wrap gap-1.5">
          {MEALS.map((m) => {
            const Icon = m.icon
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMealType(m.id)}
                className={[
                  'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition',
                  mealType === m.id
                    ? 'bg-foreground text-background'
                    : 'bg-surface text-muted ring-1 ring-border',
                ].join(' ')}
              >
                <Icon size={12} />
                {m.label}
              </button>
            )
          })}
        </div>

        {tab === 'search' && (
          <>
            <label className="flex items-center gap-2 rounded-2xl bg-surface px-4 py-3 ring-1 ring-border">
              <Search size={16} className="shrink-0 text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search foods..."
                className="w-full bg-transparent text-sm outline-none"
                autoFocus
              />
            </label>
            <ul className="mt-3 space-y-1">
              {results.map((food) => (
                <li key={food.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFood(food)
                      setGrams('100')
                    }}
                    className={[
                      'flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm transition',
                      selectedFood?.id === food.id
                        ? 'bg-foreground text-background'
                        : 'hover:bg-surface',
                    ].join(' ')}
                  >
                    <div>
                      <span className="font-medium">{food.name}</span>
                      {food.brand && (
                        <span className={['ml-1 text-xs', selectedFood?.id === food.id ? 'opacity-70' : 'text-muted'].join(' ')}>
                          · {food.brand}
                        </span>
                      )}
                    </div>
                    <span className="text-xs tabular-nums opacity-70">{food.caloriesPer100g} kcal</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {tab === 'recent' && (
          <ul className="space-y-1">
            {recentFoods.length === 0 ? (
              <div className="py-8 text-center">
                <Apple size={28} className="mx-auto text-muted" />
                <p className="mt-2 text-sm text-muted">No recent foods yet</p>
              </div>
            ) : (
              recentFoods.map((food) => (
                <li key={food.id}>
                  <button
                    type="button"
                    onClick={() => handleLog(food, 100)}
                    className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm hover:bg-surface"
                  >
                    <span className="font-medium">{food.name}</span>
                    <span className="text-xs text-muted">Tap to log 100g</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        )}

        {tab === 'scan' && (
          <BarcodeScanner
            lookupBarcode={lookupFoodByBarcode}
            onFoodFound={(food, servingGrams) => handleLog(food, servingGrams)}
            onClose={onClose}
          />
        )}

        {tab === 'custom' && (
          <form onSubmit={handleCustomSubmit} className="space-y-3">
            <input
              placeholder="Food name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full rounded-2xl bg-surface px-4 py-3 text-sm ring-1 ring-border outline-none"
              required
            />
            <div className="grid grid-cols-2 gap-2">
              {[
                { val: customCal, set: setCustomCal, ph: 'Cal/100g' },
                { val: customProtein, set: setCustomProtein, ph: 'Protein/100g' },
                { val: customCarbs, set: setCustomCarbs, ph: 'Carbs/100g' },
                { val: customFat, set: setCustomFat, ph: 'Fat/100g' },
              ].map(({ val, set, ph }) => (
                <input
                  key={ph}
                  placeholder={ph}
                  type="number"
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  className="rounded-2xl bg-surface px-4 py-3 text-sm ring-1 ring-border outline-none"
                  required
                />
              ))}
            </div>
            <Button type="submit" className="w-full py-3">Save & log 100g</Button>
          </form>
        )}
      </div>

      {tab !== 'custom' && tab !== 'scan' && selectedFood && (
        <div className="border-t border-border p-4">
          <p className="font-medium">{selectedFood.name}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {SERVING_PRESETS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGrams(String(g))}
                className={[
                  'rounded-full px-3 py-1 text-xs font-medium transition',
                  Number(grams) === g
                    ? 'bg-foreground text-background'
                    : 'bg-surface text-muted ring-1 ring-border',
                ].join(' ')}
              >
                {g}g
              </button>
            ))}
          </div>
          <input
            type="number"
            min={1}
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
            className="mt-3 w-full rounded-2xl bg-surface px-4 py-3 text-sm ring-1 ring-border outline-none"
          />
          {preview && (
            <div className="mt-3 flex gap-3 text-xs text-muted">
              <span className="font-semibold text-foreground">{preview.calories} kcal</span>
              <span>P {preview.protein}g</span>
              <span>C {preview.carbs}g</span>
              <span>F {preview.fat}g</span>
            </div>
          )}
          <Button
            type="button"
            onClick={() => handleLog(selectedFood, Number(grams))}
            className="mt-4 w-full py-3"
          >
            Log food
          </Button>
        </div>
      )}
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
            />
          </div>
        </aside>
      </div>

      <button
        type="button"
        onClick={() => openAdd(addMeal)}
        className="fixed right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition hover:scale-105 lg:hidden"
        style={{ bottom: 'calc(var(--mobile-nav-height) + 1rem)' }}
        aria-label="Add food"
      >
        <Plus size={24} />
      </button>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 lg:hidden">
          <button type="button" className="flex-1" onClick={() => setShowAdd(false)} aria-label="Close" />
          <div style={{ marginBottom: 'var(--mobile-nav-height)' }}>
            <AddFoodPanel
              onClose={() => setShowAdd(false)}
              dateKey={selectedDate}
              defaultMeal={addMeal}
            />
          </div>
        </div>
      )}

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
