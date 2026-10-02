import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { USER_DATA_KEYS } from '../lib/userDataKeys'
import { loadUserDataValue, scheduleUserDataSave } from '../lib/userDataSync'

export interface BodyWeightEntry {
  id: string
  date: string
  kg: number
}

function normalize(raw: unknown): BodyWeightEntry[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const record = item as Record<string, unknown>
      const kg = Number(record.kg)
      if (!record.id || typeof record.date !== 'string' || !Number.isFinite(kg) || kg <= 0) {
        return null
      }
      return { id: String(record.id), date: record.date, kg }
    })
    .filter((item): item is BodyWeightEntry => item !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export function useBodyWeight() {
  const { user, token } = useAuth()
  const userId = user?.id
  const [entries, setEntries] = useState<BodyWeightEntry[]>([])
  const [ready, setReady] = useState(false)
  const activeUserRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!userId || !token) {
      setEntries([])
      setReady(false)
      activeUserRef.current = undefined
      return
    }

    let cancelled = false
    setReady(false)
    activeUserRef.current = userId

    loadUserDataValue<unknown>(userId, token, USER_DATA_KEYS.bodyWeight, []).then((loaded) => {
      if (cancelled || activeUserRef.current !== userId) return
      setEntries(normalize(loaded))
      setReady(true)
    })

    return () => {
      cancelled = true
    }
  }, [userId, token])

  useEffect(() => {
    if (!userId || !token || !ready) return
    scheduleUserDataSave(userId, token, USER_DATA_KEYS.bodyWeight, entries)
  }, [entries, userId, token, ready])

  function logWeight(kg: number, date = new Date()) {
    const day = new Date(date)
    day.setHours(12, 0, 0, 0)
    const key = day.toDateString()
    setEntries((current) => {
      const existing = current.find((entry) => new Date(entry.date).toDateString() === key)
      if (existing) {
        return current
          .map((entry) => (entry.id === existing.id ? { ...entry, kg, date: day.toISOString() } : entry))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      }
      return [...current, { id: crypto.randomUUID(), date: day.toISOString(), kg }].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      )
    })
  }

  return { entries, ready, logWeight }
}
