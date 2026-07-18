import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { USER_DATA_KEYS } from '../lib/userDataKeys'
import { loadUserDataValue, scheduleUserDataSave } from '../lib/userDataSync'
import type { WorkoutPreferences } from '../types/workoutPreferences'

const DEFAULT_PREFERENCES: WorkoutPreferences = { onboarded: false }

function normalizePreferences(raw: unknown): WorkoutPreferences {
  if (!raw || typeof raw !== 'object') return DEFAULT_PREFERENCES
  const record = raw as Record<string, unknown>
  return {
    onboarded: record.onboarded === true,
    uiTourCompleted: record.uiTourCompleted === true,
    daysPerWeek:
      record.daysPerWeek === 3 ||
      record.daysPerWeek === 4 ||
      record.daysPerWeek === 5 ||
      record.daysPerWeek === 6
        ? record.daysPerWeek
        : undefined,
    experience:
      record.experience === 'new' ||
      record.experience === 'under_1y' ||
      record.experience === '1_3y' ||
      record.experience === '3plus'
        ? record.experience
        : undefined,
    goal:
      record.goal === 'muscle' ||
      record.goal === 'strength' ||
      record.goal === 'fat_loss' ||
      record.goal === 'general'
        ? record.goal
        : undefined,
    splitType:
      typeof record.splitType === 'string' ? (record.splitType as WorkoutPreferences['splitType']) : undefined,
  }
}

export function useWorkoutPreferences() {
  const { user, token } = useAuth()
  const userId = user?.id

  const [preferences, setPreferences] = useState<WorkoutPreferences>(DEFAULT_PREFERENCES)
  const [ready, setReady] = useState(false)
  const activeUserRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!userId || !token) {
      setPreferences(DEFAULT_PREFERENCES)
      setReady(false)
      activeUserRef.current = undefined
      return
    }

    let cancelled = false
    setReady(false)
    activeUserRef.current = userId

    loadUserDataValue<WorkoutPreferences>(
      userId,
      token,
      USER_DATA_KEYS.workoutPreferences,
      DEFAULT_PREFERENCES,
    ).then((loaded) => {
      if (cancelled || activeUserRef.current !== userId) return
      setPreferences(normalizePreferences(loaded))
      setReady(true)
    })

    return () => {
      cancelled = true
    }
  }, [userId, token])

  useEffect(() => {
    if (!userId || !token || !ready) return
    scheduleUserDataSave(userId, token, USER_DATA_KEYS.workoutPreferences, preferences)
  }, [preferences, userId, token, ready])

  function savePreferences(next: WorkoutPreferences) {
    setPreferences(next)
  }

  function skipOnboarding() {
    setPreferences((current) => ({ ...current, onboarded: true }))
  }

  function completeUiTour() {
    setPreferences((current) => ({ ...current, uiTourCompleted: true }))
  }

  return {
    preferences,
    ready,
    savePreferences,
    skipOnboarding,
    completeUiTour,
  }
}
