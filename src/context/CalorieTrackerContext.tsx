import { createContext, useContext, type ReactNode } from 'react'
import { useCalorieTracker } from '../hooks/useCalorieTracker'

type CalorieTrackerContextValue = ReturnType<typeof useCalorieTracker>

const CalorieTrackerContext = createContext<CalorieTrackerContextValue | null>(null)

export function CalorieTrackerProvider({ children }: { children: ReactNode }) {
  const value = useCalorieTracker()
  return (
    <CalorieTrackerContext.Provider value={value}>{children}</CalorieTrackerContext.Provider>
  )
}

export function useCalorieTrackerContext() {
  const ctx = useContext(CalorieTrackerContext)
  if (!ctx) {
    throw new Error('useCalorieTrackerContext must be used within CalorieTrackerProvider')
  }
  return ctx
}
