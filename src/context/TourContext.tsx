import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import AppTour from '../components/tour/AppTour'
import { useWorkoutPlan } from '../hooks/useWorkoutPlan'
import { useWorkoutPreferences } from '../hooks/useWorkoutPreferences'
import { createAppTourSteps } from '../lib/appTour'
import { daysWithPlan } from '../lib/workoutPlan'

interface TourContextValue {
  activeStepId: string | null
  isOpen: boolean
  startTour: () => void
  replayTour: () => void
}

const TourContext = createContext<TourContextValue | null>(null)

export function TourProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { plan, ready: planReady } = useWorkoutPlan()
  const { preferences, ready: prefsReady, completeUiTour } = useWorkoutPreferences()
  const [isOpen, setIsOpen] = useState(false)
  const [activeStepId, setActiveStepId] = useState<string | null>(null)

  const needsPlanOnboarding =
    planReady && prefsReady && daysWithPlan(plan).length === 0 && !preferences.onboarded

  const steps = useMemo(() => createAppTourSteps({ navigate }), [navigate])

  const startTour = useCallback(() => {
    setIsOpen(true)
    navigate('/home')
  }, [navigate])

  const replayTour = useCallback(() => {
    setIsOpen(true)
    navigate('/home')
  }, [navigate])

  const finishTour = useCallback(() => {
    setIsOpen(false)
    setActiveStepId(null)
    completeUiTour()
  }, [completeUiTour])

  useEffect(() => {
    if (!planReady || !prefsReady || needsPlanOnboarding) return
    if (!preferences.onboarded || preferences.uiTourCompleted) return

    const timer = window.setTimeout(() => startTour(), 1000)
    return () => window.clearTimeout(timer)
  }, [
    planReady,
    prefsReady,
    needsPlanOnboarding,
    preferences.onboarded,
    preferences.uiTourCompleted,
    startTour,
  ])

  const value = useMemo(
    () => ({
      activeStepId,
      isOpen,
      startTour,
      replayTour,
    }),
    [activeStepId, isOpen, startTour, replayTour],
  )

  return (
    <TourContext.Provider value={value}>
      {children}
      <AppTour
        open={isOpen}
        steps={steps}
        onStepChange={setActiveStepId}
        onComplete={finishTour}
        onSkip={finishTour}
      />
    </TourContext.Provider>
  )
}

export function useTour() {
  const context = useContext(TourContext)
  if (!context) {
    throw new Error('useTour must be used within TourProvider')
  }
  return context
}
