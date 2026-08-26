import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { USER_DATA_KEYS } from '../lib/userDataKeys'
import { loadUserDataValue, scheduleUserDataSave } from '../lib/userDataSync'
import { toDateKey } from '../pages/home/homeUtils'
import {
  DEFAULT_WINTER_ARC_WEEKLY_TARGET,
  normalizeCompletedByDate,
  normalizeWinterArcTasks,
  WORKOUT_TASK_ID,
} from '../lib/winterArc'
import {
  DEFAULT_WINTER_ARC_STATE,
  type WinterArcState,
} from '../types/winterArc'

function normalizeWinterArcState(raw: unknown): WinterArcState {
  if (!raw || typeof raw !== 'object') return DEFAULT_WINTER_ARC_STATE
  const record = raw as Record<string, unknown>
  const workoutsPerWeek =
    typeof record.workoutsPerWeek === 'number' && record.workoutsPerWeek > 0
      ? Math.round(record.workoutsPerWeek)
      : DEFAULT_WINTER_ARC_WEEKLY_TARGET

  return {
    enrolled: record.enrolled === true,
    enrolledAt: typeof record.enrolledAt === 'string' ? record.enrolledAt : null,
    workoutsPerWeek,
    showOnHome: record.showOnHome !== false,
    tasks: normalizeWinterArcTasks(record.tasks),
    completedByDate: normalizeCompletedByDate(record.completedByDate),
  }
}

export function useWinterArc() {
  const { user, token } = useAuth()
  const userId = user?.id

  const [state, setState] = useState<WinterArcState>(DEFAULT_WINTER_ARC_STATE)
  const [ready, setReady] = useState(false)
  const activeUserRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!userId || !token) {
      setState(DEFAULT_WINTER_ARC_STATE)
      setReady(false)
      activeUserRef.current = undefined
      return
    }

    let cancelled = false
    setReady(false)
    activeUserRef.current = userId

    loadUserDataValue<WinterArcState>(
      userId,
      token,
      USER_DATA_KEYS.winterArc,
      DEFAULT_WINTER_ARC_STATE,
    ).then((loaded) => {
      if (cancelled || activeUserRef.current !== userId) return
      setState(normalizeWinterArcState(loaded))
      setReady(true)
    })

    return () => {
      cancelled = true
    }
  }, [userId, token])

  useEffect(() => {
    if (!userId || !token || !ready) return
    scheduleUserDataSave(userId, token, USER_DATA_KEYS.winterArc, state)
  }, [state, userId, token, ready])

  function enroll() {
    setState({
      enrolled: true,
      enrolledAt: toDateKey(new Date()),
      workoutsPerWeek: DEFAULT_WINTER_ARC_WEEKLY_TARGET,
      showOnHome: true,
      tasks: [],
      completedByDate: {},
    })
  }

  function leave() {
    setState(DEFAULT_WINTER_ARC_STATE)
  }

  function setShowOnHome(show: boolean) {
    setState((current) => ({ ...current, showOnHome: show }))
  }

  function addTask(label: string) {
    const trimmed = label.trim()
    if (!trimmed) return
    setState((current) => ({
      ...current,
      tasks: [...current.tasks, { id: `task_${Date.now()}`, label: trimmed }],
    }))
  }

  function removeTask(taskId: string) {
    setState((current) => {
      const completedByDate: Record<string, string[]> = {}
      for (const [dateKey, ids] of Object.entries(current.completedByDate)) {
        completedByDate[dateKey] = ids.filter((id) => id !== taskId)
      }
      return {
        ...current,
        tasks: current.tasks.filter((task) => task.id !== taskId),
        completedByDate,
      }
    })
  }

  function toggleTask(taskId: string, dateKey = toDateKey(new Date())) {
    if (taskId === WORKOUT_TASK_ID) return
    setState((current) => {
      const previous = current.completedByDate[dateKey] ?? []
      const next = previous.includes(taskId)
        ? previous.filter((id) => id !== taskId)
        : [...previous, taskId]
      return {
        ...current,
        completedByDate: { ...current.completedByDate, [dateKey]: next },
      }
    })
  }

  return {
    state,
    ready,
    enroll,
    leave,
    setShowOnHome,
    addTask,
    removeTask,
    toggleTask,
  }
}
