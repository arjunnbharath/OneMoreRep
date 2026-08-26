import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { USER_DATA_KEYS } from '../lib/userDataKeys'
import { loadUserDataValue, scheduleUserDataSave } from '../lib/userDataSync'
import {
  DEFAULT_HOME_PREFERENCES,
  type HomePreferences,
} from '../types/homePreferences'

function normalizeHomePreferences(raw: unknown): HomePreferences {
  if (!raw || typeof raw !== 'object') return DEFAULT_HOME_PREFERENCES
  const record = raw as Record<string, unknown>
  return {
    showSugarCutStreak: record.showSugarCutStreak === true,
  }
}

export function useHomePreferences() {
  const { user, token } = useAuth()
  const userId = user?.id

  const [preferences, setPreferences] = useState<HomePreferences>(DEFAULT_HOME_PREFERENCES)
  const [ready, setReady] = useState(false)
  const activeUserRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!userId || !token) {
      setPreferences(DEFAULT_HOME_PREFERENCES)
      setReady(false)
      activeUserRef.current = undefined
      return
    }

    let cancelled = false
    setReady(false)
    activeUserRef.current = userId

    loadUserDataValue<HomePreferences>(
      userId,
      token,
      USER_DATA_KEYS.homePreferences,
      DEFAULT_HOME_PREFERENCES,
    ).then((loaded) => {
      if (cancelled || activeUserRef.current !== userId) return
      setPreferences(normalizeHomePreferences(loaded))
      setReady(true)
    })

    return () => {
      cancelled = true
    }
  }, [userId, token])

  useEffect(() => {
    if (!userId || !token || !ready) return
    scheduleUserDataSave(userId, token, USER_DATA_KEYS.homePreferences, preferences)
  }, [preferences, userId, token, ready])

  function setShowSugarCutStreak(show: boolean) {
    setPreferences((current) => ({ ...current, showSugarCutStreak: show }))
  }

  return {
    preferences,
    ready,
    setShowSugarCutStreak,
  }
}
