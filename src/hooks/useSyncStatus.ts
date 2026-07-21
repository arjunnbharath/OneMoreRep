import { useEffect, useState } from 'react'
import { getPendingSyncCount, subscribeSyncStatus } from '../lib/userDataSync'

export function useSyncStatus() {
  const [pendingCount, setPendingCount] = useState(getPendingSyncCount)

  useEffect(() => {
    return subscribeSyncStatus(() => setPendingCount(getPendingSyncCount()))
  }, [])

  return { pendingCount, hasPendingSync: pendingCount > 0 }
}
