import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import AddFoodPanel from './AddFoodPanel'
import type { MealType } from '../../types/nutrition'

interface AddFoodModalProps {
  open: boolean
  onClose: () => void
  dateKey: string
  defaultMeal?: MealType
}

export default function AddFoodModal({ open, onClose, dateKey, defaultMeal }: AddFoodModalProps) {
  const [mounted, setMounted] = useState(open)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true))
      })
      return () => cancelAnimationFrame(frame)
    }

    setVisible(false)
    const timer = window.setTimeout(() => setMounted(false), 380)
    return () => window.clearTimeout(timer)
  }, [open])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden" aria-hidden={!open}>
      <button
        type="button"
        aria-label="Close add food"
        onClick={onClose}
        className={[
          'absolute inset-0 bg-black/45 transition-opacity duration-300',
          visible ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
      />

      <div
        className="absolute inset-x-0 bottom-0 flex justify-center"
        style={{ paddingBottom: 'var(--mobile-nav-height)' }}
      >
        <div
          className={[
            'add-food-sheet w-full max-w-lg overflow-hidden rounded-t-3xl bg-background shadow-2xl ring-1 ring-border',
            visible ? 'add-food-sheet--open' : 'add-food-sheet--closed',
          ].join(' ')}
          style={{ height: 'min(90dvh, 720px)' }}
        >
          <AddFoodPanel
            key={`${dateKey}-${defaultMeal ?? 'lunch'}-${open}`}
            onClose={onClose}
            dateKey={dateKey}
            defaultMeal={defaultMeal}
            variant="sheet"
          />
        </div>
      </div>
    </div>
  )
}

interface AddFoodFabProps {
  onClick: () => void
  hidden?: boolean
}

export function AddFoodFab({ onClick, hidden }: AddFoodFabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Add food"
      className={[
        'fixed right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-all duration-300 ease-out hover:scale-105',
        hidden ? 'pointer-events-none scale-50 opacity-0' : 'scale-100 opacity-100',
      ].join(' ')}
      style={{ bottom: 'calc(var(--mobile-nav-height) + 1rem)' }}
    >
      <Plus size={24} />
    </button>
  )
}
