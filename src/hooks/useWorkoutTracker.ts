import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import type { TrackedExercise, WorkoutSession, WorkoutSet } from '../types/tracker'
import { USER_DATA_KEYS } from '../lib/userDataKeys'
import { loadUserDataValue, scheduleUserDataSave } from '../lib/userDataSync'

const LEGACY_SESSIONS_KEY = 'onemorerep-tracker'
const LEGACY_ACTIVE_KEY = 'onemorerep-active-session'

function createId() {
  return crypto.randomUUID()
}

export function useWorkoutTracker() {
  const { user, token } = useAuth()
  const userId = user?.id

  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null)
  const [ready, setReady] = useState(false)
  const activeUserRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!userId || !token) {
      setSessions([])
      setActiveSession(null)
      setReady(false)
      activeUserRef.current = undefined
      return
    }

    let cancelled = false
    setReady(false)
    activeUserRef.current = userId

    Promise.all([
      loadUserDataValue<WorkoutSession[]>(
        userId,
        token,
        USER_DATA_KEYS.trackerSessions,
        [],
        LEGACY_SESSIONS_KEY,
      ),
      loadUserDataValue<WorkoutSession | null>(
        userId,
        token,
        USER_DATA_KEYS.trackerActive,
        null,
        LEGACY_ACTIVE_KEY,
      ),
    ]).then(([loadedSessions, loadedActive]) => {
      if (cancelled || activeUserRef.current !== userId) return
      setSessions(loadedSessions)
      setActiveSession(loadedActive)
      setReady(true)
    })

    return () => {
      cancelled = true
    }
  }, [userId, token])

  useEffect(() => {
    if (!userId || !token || !ready) return
    scheduleUserDataSave(userId, token, USER_DATA_KEYS.trackerSessions, sessions)
  }, [sessions, userId, token, ready])

  useEffect(() => {
    if (!userId || !token || !ready) return
    scheduleUserDataSave(userId, token, USER_DATA_KEYS.trackerActive, activeSession)
  }, [activeSession, userId, token, ready])

  function startSession(name = "Today's Workout") {
    const session: WorkoutSession = {
      id: createId(),
      name,
      date: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      note: '',
      exercises: [],
    }
    setActiveSession(session)
    return session
  }

  function addExercise(name: string, setCount: number, reps: number, weight?: number) {
    const sets: WorkoutSet[] = Array.from({ length: setCount }, () => ({
      id: createId(),
      reps,
      weight: weight || undefined,
      completed: false,
    }))

    const exercise: TrackedExercise = {
      id: createId(),
      name: name.trim(),
      sets,
    }

    setActiveSession((prev) => {
      if (!prev) {
        const session: WorkoutSession = {
          id: createId(),
          name: "Today's Workout",
          date: new Date().toISOString(),
          startedAt: new Date().toISOString(),
          note: '',
          exercises: [exercise],
        }
        return session
      }
      return { ...prev, exercises: [...prev.exercises, exercise] }
    })
  }

  function removeExercise(exerciseId: string) {
    setActiveSession((prev) =>
      prev
        ? { ...prev, exercises: prev.exercises.filter((e) => e.id !== exerciseId) }
        : prev,
    )
  }

  function addSetToExercise(exerciseId: string, reps: number, weight?: number) {
    setActiveSession((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        exercises: prev.exercises.map((ex) =>
          ex.id === exerciseId
            ? {
                ...ex,
                sets: [
                  ...ex.sets,
                  { id: createId(), reps, weight: weight || undefined, completed: false },
                ],
              }
            : ex,
        ),
      }
    })
  }

  function updateSet(exerciseId: string, setId: string, reps: number, weight?: number) {
    setActiveSession((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        exercises: prev.exercises.map((ex) =>
          ex.id === exerciseId
            ? {
                ...ex,
                sets: ex.sets.map((s) =>
                  s.id === setId ? { ...s, reps, weight: weight || undefined } : s,
                ),
              }
            : ex,
        ),
      }
    })
  }

  function toggleSetComplete(exerciseId: string, setId: string) {
    setActiveSession((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        exercises: prev.exercises.map((ex) =>
          ex.id === exerciseId
            ? {
                ...ex,
                sets: ex.sets.map((s) =>
                  s.id === setId ? { ...s, completed: !s.completed } : s,
                ),
              }
            : ex,
        ),
      }
    })
  }

  function toggleSetWarmup(exerciseId: string, setId: string) {
    setActiveSession((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        exercises: prev.exercises.map((ex) =>
          ex.id === exerciseId
            ? {
                ...ex,
                sets: ex.sets.map((s) =>
                  s.id === setId ? { ...s, isWarmup: !s.isWarmup } : s,
                ),
              }
            : ex,
        ),
      }
    })
  }

  function removeSet(exerciseId: string, setId: string) {
    setActiveSession((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        exercises: prev.exercises
          .map((ex) =>
            ex.id === exerciseId
              ? { ...ex, sets: ex.sets.filter((s) => s.id !== setId) }
              : ex,
          )
          .filter((ex) => ex.sets.length > 0),
      }
    })
  }

  function finishSession() {
    if (!activeSession || activeSession.exercises.length === 0) return
    const completed: WorkoutSession = {
      ...activeSession,
      completedAt: new Date().toISOString(),
    }
    setSessions((prev) => [completed, ...prev])
    setActiveSession(null)
    return completed
  }

  function duplicateSession(sessionId: string) {
    const source = sessions.find((s) => s.id === sessionId)
    if (!source) return

    const now = new Date().toISOString()
    const copy: WorkoutSession = {
      id: createId(),
      name: source.name,
      date: now,
      startedAt: now,
      note: '',
      exercises: source.exercises.map((ex) => ({
        id: createId(),
        name: ex.name,
        sets: ex.sets.map((s) => ({
          id: createId(),
          reps: s.reps,
          weight: s.weight,
          completed: false,
          isWarmup: s.isWarmup,
        })),
      })),
    }
    setActiveSession(copy)
    return copy
  }

  function deleteSession(sessionId: string) {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId))
  }

  function updateSessionName(name: string) {
    setActiveSession((prev) => (prev ? { ...prev, name } : prev))
  }

  function updateSessionNote(note: string) {
    setActiveSession((prev) => (prev ? { ...prev, note } : prev))
  }

  return {
    sessions,
    activeSession,
    ready,
    startSession,
    addExercise,
    removeExercise,
    addSetToExercise,
    updateSet,
    toggleSetComplete,
    toggleSetWarmup,
    removeSet,
    finishSession,
    duplicateSession,
    deleteSession,
    updateSessionName,
    updateSessionNote,
    setActiveSession,
  }
}
