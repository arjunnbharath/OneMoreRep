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
  const [stepIndex, setStepIndex] = useState(0)
  const [tourSession, setTourSession] = useState(0)

  const steps = useMemo(() => createAppTourSteps({ navigate }), [navigate])
  const activeStepId = isOpen ? (steps[stepIndex]?.id ?? null) : null

  const needsPlanOnboarding =
    planReady && prefsReady && daysWithPlan(plan).length === 0 && !preferences.onboarded

  const startTour = useCallback(() => {
    setTourSession((session) => session + 1)
    setStepIndex(0)
    setIsOpen(true)
    navigate('/home')
  }, [navigate])

  const replayTour = useCallback(() => {
    setTourSession((session) => session + 1)
    setStepIndex(0)
    setIsOpen(true)
    navigate('/home')
  }, [navigate])

  const finishTour = useCallback(() => {
    setIsOpen(false)
    setStepIndex(0)
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
        key={tourSession}
        open={isOpen}
        steps={steps}
        stepIndex={stepIndex}
        onStepIndexChange={setStepIndex}
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
