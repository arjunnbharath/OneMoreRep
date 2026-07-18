import { useEffect, useState } from 'react'
import { isAppInstalled, subscribePwaInstall } from '../lib/pwaInstall'

export function useAppInstalled() {
  const [installed, setInstalled] = useState(isAppInstalled)

  useEffect(() => subscribePwaInstall(() => setInstalled(isAppInstalled())), [])

  return installed
}
