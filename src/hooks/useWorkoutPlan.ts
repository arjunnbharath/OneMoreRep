import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import type { ExerciseGroup } from '../data/exerciseGuides'
import { USER_DATA_KEYS } from '../lib/userDataKeys'
import { loadUserDataValue, scheduleUserDataSave } from '../lib/userDataSync'
import { emptyWeeklyPlan, normalizeWeeklyPlan } from '../lib/workoutPlan'
import type { PlanExercise, Weekday, WeeklyPlan } from '../types/workoutPlan'

function createId() {
  return crypto.randomUUID()
}

export function useWorkoutPlan() {
  const { user, token } = useAuth()
  const userId = user?.id

  const [plan, setPlan] = useState<WeeklyPlan>(emptyWeeklyPlan)
  const [ready, setReady] = useState(false)
  const activeUserRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!userId || !token) {
      setPlan(emptyWeeklyPlan())
      setReady(false)
      activeUserRef.current = undefined
      return
    }

    let cancelled = false
    setReady(false)
    activeUserRef.current = userId

    loadUserDataValue<WeeklyPlan>(
      userId,
      token,
      USER_DATA_KEYS.workoutPlan,
      emptyWeeklyPlan(),
    ).then((loaded) => {
      if (cancelled || activeUserRef.current !== userId) return
      setPlan(normalizeWeeklyPlan(loaded))
      setReady(true)
    })

    return () => {
      cancelled = true
    }
  }, [userId, token])

  useEffect(() => {
    if (!userId || !token || !ready) return
    scheduleUserDataSave(userId, token, USER_DATA_KEYS.workoutPlan, plan)
  }, [plan, userId, token, ready])

  function addMuscleToDay(day: Weekday, group: ExerciseGroup) {
    setPlan((prev) => {
      const dayPlan = prev[day]
      if (dayPlan.muscles.includes(group)) return prev
      return {
        ...prev,
        [day]: {
          ...dayPlan,
          muscles: [...dayPlan.muscles, group],
          exercises: { ...dayPlan.exercises, [group]: dayPlan.exercises[group] ?? [] },
        },
      }
    })
  }

  function removeMuscleFromDay(day: Weekday, group: ExerciseGroup) {
    setPlan((prev) => {
      const dayPlan = prev[day]
      const { [group]: _, ...rest } = dayPlan.exercises
      return {
        ...prev,
        [day]: {
          muscles: dayPlan.muscles.filter((m) => m !== group),
          exercises: rest,
        },
      }
    })
  }

  function addExercise(
    day: Weekday,
    group: ExerciseGroup,
    name: string,
    sets: number,
    reps: number,
    weight?: number,
  ) {
    const trimmed = name.trim()
    if (!trimmed) return

    const entry: PlanExercise = {
      id: createId(),
      name: trimmed,
      sets: Math.max(1, sets),
      reps: Math.max(1, reps),
      weight: weight || undefined,
    }

    setPlan((prev) => {
      const dayPlan = prev[day]
      const muscles = dayPlan.muscles.includes(group)
        ? dayPlan.muscles
        : [...dayPlan.muscles, group]
      const current = dayPlan.exercises[group] ?? []

      return {
        ...prev,
        [day]: {
          muscles,
          exercises: {
            ...dayPlan.exercises,
            [group]: [...current, entry],
          },
        },
      }
    })
  }

  function removeExercise(day: Weekday, group: ExerciseGroup, exerciseId: string) {
    setPlan((prev) => {
      const dayPlan = prev[day]
      const updated = (dayPlan.exercises[group] ?? []).filter((e) => e.id !== exerciseId)
      return {
        ...prev,
        [day]: {
          ...dayPlan,
          exercises: { ...dayPlan.exercises, [group]: updated },
        },
      }
    })
  }

  function replacePlan(next: WeeklyPlan) {
    setPlan(next)
  }

  return {
    plan,
    ready,
    addMuscleToDay,
    removeMuscleFromDay,
    addExercise,
    removeExercise,
    replacePlan,
  }
}
