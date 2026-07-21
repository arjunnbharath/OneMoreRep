import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Cookie,
  Minus,
  Moon,
  Plus,
  Search,
  Sun,
  X,
} from 'lucide-react'
import BarcodeScanner from './BarcodeScanner'
import FoodPhotoScanner from './FoodPhotoScanner'
import Button from '../Button'
import { commonFoods } from '../../data/commonFoods'
import { macrosForGrams } from '../../lib/nutritionMath'
import { formatMacroPreview } from '../../lib/foodNutritionDisplay'
import { useCalorieTrackerContext } from '../../context/CalorieTrackerContext'
import type { FoodItem, MealType } from '../../types/nutrition'

export const MEALS: { id: MealType; label: string; icon: typeof Coffee }[] = [
  { id: 'breakfast', label: 'Breakfast', icon: Coffee },
  { id: 'lunch', label: 'Lunch', icon: Sun },
  { id: 'dinner', label: 'Dinner', icon: Moon },
  { id: 'snack', label: 'Snacks', icon: Cookie },
]

type TabId = 'search' | 'recent' | 'scan' | 'photo' | 'custom'
type Step = 'browse' | 'serving'

const QUICK_PICKS = commonFoods.slice(0, 8)
const SERVING_PRESETS = [50, 100, 150, 200]

export interface AddFoodPanelProps {
  onClose: () => void
  dateKey: string
  defaultMeal?: MealType
  variant?: 'sheet' | 'embedded'
}

export default function AddFoodPanel({
  onClose,
  dateKey,
  defaultMeal,
  variant = 'sheet',
}: AddFoodPanelProps) {
  const { logFood, searchFoods, recentFoods, addCustomFood, lookupFoodByBarcode, searchFoodOnline } =
    useCalorieTrackerContext()

  const [step, setStep] = useState<Step>('browse')
  const [tab, setTab] = useState<TabId>('search')
  const [query, setQuery] = useState('')
  const [mealType, setMealType] = useState<MealType>(defaultMeal ?? 'lunch')
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [grams, setGrams] = useState('100')
  const [customName, setCustomName] = useState('')
  const [customCal, setCustomCal] = useState('')
  const [customProtein, setCustomProtein] = useState('')
  const [customCarbs, setCustomCarbs] = useState('')
  const [customFat, setCustomFat] = useState('')

  useEffect(() => {
    if (defaultMeal) setMealType(defaultMeal)
  }, [defaultMeal])

  const mealLabel = MEALS.find((m) => m.id === mealType)?.label ?? 'meal'
  const results = useMemo(() => searchFoods(query), [query, searchFoods])
  const preview = selectedFood ? macrosForGrams(selectedFood, Number(grams) || 0) : null

  function handleLog(food: FoodItem, quantity: number) {
    if (quantity <= 0) return
    logFood({ food, mealType, quantityGrams: quantity, dateKey })
    onClose()
  }

  function openServing(food: FoodItem) {
    setSelectedFood(food)
    setGrams(String(food.suggestedServingGrams ?? 100))
    setStep('serving')
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

  if (step === 'serving' && selectedFood && preview) {
    const qty = Number(grams) || 0
    return (
      <div className="add-food-step-enter flex h-full min-h-0 flex-col">
        <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
          <button
            type="button"
            onClick={() => setStep('browse')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface ring-1 ring-border"
            aria-label="Back"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold">{selectedFood.name}</h3>
            <p className="text-xs text-muted">Add to {mealLabel}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-surface"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex flex-1 flex-col justify-center px-6 py-8">
          <div className="flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => setGrams(String(Math.max(1, qty - 10)))}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface ring-1 ring-border"
            >
              <Minus size={20} />
            </button>
            <div className="text-center">
              <input
                type="number"
                min={1}
                value={grams}
                onChange={(e) => setGrams(e.target.value)}
                className="w-28 border-b-2 border-foreground bg-transparent text-center text-4xl font-semibold tabular-nums outline-none"
              />
              <p className="mt-1 text-sm text-muted">grams</p>
            </div>
            <button
              type="button"
              onClick={() => setGrams(String(qty + 10))}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface ring-1 ring-border"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {SERVING_PRESETS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGrams(String(g))}
                className={[
                  'rounded-full px-4 py-1.5 text-sm font-medium transition',
                  qty === g ? 'bg-foreground text-background' : 'bg-surface text-muted ring-1 ring-border',
                ].join(' ')}
              >
                {g}g
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-2xl bg-surface p-5 ring-1 ring-border">
            <p className="text-center text-3xl font-semibold tabular-nums">{preview.calories} kcal</p>
            <p className="mt-2 text-center text-sm text-muted">{formatMacroPreview(preview)}</p>
          </div>
        </div>

        <div className="shrink-0 border-t border-border p-4">
          <Button
            type="button"
            onClick={() => handleLog(selectedFood, qty)}
            disabled={qty <= 0}
            className="w-full py-3.5 text-base font-semibold"
          >
            Add to {mealLabel}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={[
        'flex min-h-0 flex-col',
        variant === 'embedded' ? 'rounded-2xl ring-1 ring-border' : 'h-full',
      ].join(' ')}
    >
      <div className="flex shrink-0 flex-col items-center pt-2">
        {variant === 'sheet' && (
          <div className="mb-3 h-1 w-10 rounded-full bg-border" aria-hidden />
        )}
        <header className="flex w-full items-center justify-between px-4 pb-3">
          <div>
            <h3 className="text-lg font-semibold">Add food</h3>
            <p className="text-xs text-muted">{mealLabel}</p>
          </div>
          {variant === 'sheet' && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface ring-1 ring-border"
            >
              <X size={16} />
            </button>
          )}
        </header>
      </div>

      <div className="shrink-0 px-4 pb-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {MEALS.map((meal) => {
            const Icon = meal.icon
            const active = mealType === meal.id
            return (
              <button
                key={meal.id}
                type="button"
                onClick={() => setMealType(meal.id)}
                className={[
                  'flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition',
                  active
                    ? 'bg-foreground text-background'
                    : 'bg-surface text-muted ring-1 ring-border',
                ].join(' ')}
              >
                <Icon size={13} />
                {meal.label}
              </button>
            )
          })}
        </div>

        <div className="mt-3 flex rounded-xl bg-surface p-1 ring-1 ring-border">
          {(
            [
              ['search', 'Search'],
              ['recent', 'Recent'],
              ['scan', 'Scan'],
              ['photo', 'Photo'],
              ['custom', 'Custom'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={[
                'flex-1 rounded-lg py-2 text-xs font-medium transition',
                tab === id ? 'bg-background text-foreground shadow-sm' : 'text-muted',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        {tab === 'search' && (
          <div className="space-y-3">
            <label className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2.5 ring-1 ring-border">
              <Search size={16} className="text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search foods..."
                className="w-full bg-transparent text-sm outline-none"
                autoFocus={variant === 'sheet'}
              />
            </label>

            {!query.trim() && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {QUICK_PICKS.map((food) => (
                  <button
                    key={food.id}
                    type="button"
                    onClick={() => openServing(food)}
                    className="shrink-0 rounded-xl bg-surface px-3 py-2 text-left ring-1 ring-border transition active:scale-[0.98]"
                  >
                    <p className="text-xs font-medium">{food.name}</p>
                    <p className="text-[10px] text-muted">{food.caloriesPer100g} kcal</p>
                  </button>
                ))}
              </div>
            )}

            <ul className="divide-y divide-border overflow-hidden rounded-xl bg-surface ring-1 ring-border">
              {(query.trim() ? results : results.slice(0, 14)).map((food) => (
                <li key={food.id}>
                  <button
                    type="button"
                    onClick={() => openServing(food)}
                    className="flex w-full items-center gap-3 px-3 py-3 text-left transition active:bg-background"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{food.name}</p>
                      {food.brand && <p className="truncate text-xs text-muted">{food.brand}</p>}
                    </div>
                    <span className="shrink-0 text-xs tabular-nums text-muted">
                      {food.caloriesPer100g} kcal
                    </span>
                    <ChevronRight size={14} className="shrink-0 text-muted" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === 'recent' && (
          <ul className="divide-y divide-border overflow-hidden rounded-xl bg-surface ring-1 ring-border">
            {recentFoods.length === 0 ? (
              <li className="px-4 py-10 text-center text-sm text-muted">No recent foods yet</li>
            ) : (
              recentFoods.map((food) => (
                <li key={food.id}>
                  <button
                    type="button"
                    onClick={() => openServing(food)}
                    className="flex w-full items-center gap-3 px-3 py-3 text-left active:bg-background"
                  >
                    <Clock size={14} className="shrink-0 text-muted" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{food.name}</span>
                    <span className="text-xs text-muted">{food.caloriesPer100g} kcal</span>
                    <ChevronRight size={14} className="text-muted" />
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

        {tab === 'photo' && (
          <FoodPhotoScanner
            searchFoodOnline={searchFoodOnline}
            searchFoodLocal={searchFoods}
            onFoodSelected={openServing}
          />
        )}

        {tab === 'custom' && (
          <form onSubmit={handleCustomSubmit} className="space-y-3 rounded-xl bg-surface p-4 ring-1 ring-border">
            <input
              placeholder="Food name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full rounded-xl bg-background px-3 py-2.5 text-sm ring-1 ring-border outline-none"
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
                  className="rounded-xl bg-background px-3 py-2.5 text-sm ring-1 ring-border outline-none"
                  required
                />
              ))}
            </div>
            <Button type="submit" className="w-full py-2.5">
              Save & log 100g
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
