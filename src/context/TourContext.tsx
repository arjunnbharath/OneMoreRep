import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import AppTour from '../components/tour/AppTour'
import { useWorkoutPreferences } from '../hooks/useWorkoutPreferences'
import { createAppTourSteps } from '../lib/appTour'
import {
  clearTourSession,
  getSavedTourStep,
  hasPendingTour,
  hasTourActive,
  markTourActive,
  saveTourStep,
} from '../lib/tourSession'

interface TourContextValue {
  activeStepId: string | null
  isOpen: boolean
  startTour: () => void
  replayTour: () => void
}

const TourContext = createContext<TourContextValue | null>(null)

export function TourProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { preferences, ready: prefsReady, completeUiTour } = useWorkoutPreferences()
  const [isOpen, setIsOpen] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [tourSession, setTourSession] = useState(0)
  const didBootstrapRef = useRef(false)

  const steps = useMemo(() => createAppTourSteps({ navigate }), [navigate])
  const stepsRef = useRef(steps)
  stepsRef.current = steps
  const activeStepId = isOpen ? (steps[stepIndex]?.id ?? null) : null

  const openTourAt = useCallback((index: number, bumpSession: boolean) => {
    const step = stepsRef.current[index]
    if (step?.onEnter) {
      void Promise.resolve(step.onEnter())
    } else if (index === 0) {
      navigate('/home')
    }

    if (bumpSession) {
      setTourSession((session) => session + 1)
    }
    setStepIndex(index)
    setIsOpen(true)
    markTourActive(index)
  }, [navigate])

  const startTour = useCallback(() => {
    if (isOpen) return
    openTourAt(0, true)
  }, [isOpen, openTourAt])

  const replayTour = useCallback(() => {
    clearTourSession()
    openTourAt(0, true)
  }, [openTourAt])

  const finishTour = useCallback(() => {
    setIsOpen(false)
    setStepIndex(0)
    clearTourSession()
    completeUiTour()
  }, [completeUiTour])

  useEffect(() => {
    if (!isOpen) return
    saveTourStep(stepIndex)
  }, [isOpen, stepIndex])

  useEffect(() => {
    if (!prefsReady || preferences.uiTourCompleted) return
    if (didBootstrapRef.current) return

    const shouldStart = hasPendingTour()
    const shouldResume = hasTourActive()
    if (!shouldStart && !shouldResume) return

    didBootstrapRef.current = true

    const resumeStep = shouldResume ? getSavedTourStep() : 0
    if (shouldStart && !shouldResume) {
      markTourActive(0)
    }

    let cancelled = false
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return
        openTourAt(resumeStep, true)
      })
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
    }
  }, [prefsReady, preferences.uiTourCompleted, openTourAt])

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
