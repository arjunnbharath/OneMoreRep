import { useEffect, useState } from 'react'
import type { TrackedExercise, WorkoutSession, WorkoutSet } from '../types/tracker'

const STORAGE_KEY = 'onemorerep-tracker'

function loadSessions(): WorkoutSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as WorkoutSession[]) : []
  } catch {
    return []
  }
}

function saveSessions(sessions: WorkoutSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}

function createId() {
  return crypto.randomUUID()
}

export function useWorkoutTracker() {
  const [sessions, setSessions] = useState<WorkoutSession[]>(loadSessions)
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null)

  useEffect(() => {
    saveSessions(sessions)
  }, [sessions])

  function startSession(name = 'Today\'s Workout') {
    const session: WorkoutSession = {
      id: createId(),
      name,
      date: new Date().toISOString(),
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
    }))

    const exercise: TrackedExercise = {
      id: createId(),
      name: name.trim(),
      sets,
    }

    setActiveSession((prev) => {
      if (!prev) {
        const session = {
          id: createId(),
          name: 'Today\'s Workout',
          date: new Date().toISOString(),
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
                sets: [...ex.sets, { id: createId(), reps, weight: weight || undefined }],
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
    setSessions((prev) => [activeSession, ...prev])
    setActiveSession(null)
  }

  function deleteSession(sessionId: string) {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId))
  }

  function updateSessionName(name: string) {
    setActiveSession((prev) => (prev ? { ...prev, name } : prev))
  }

  return {
    sessions,
    activeSession,
    startSession,
    addExercise,
    removeExercise,
    addSetToExercise,
    updateSet,
    removeSet,
    finishSession,
    deleteSession,
    updateSessionName,
    setActiveSession,
  }
}
