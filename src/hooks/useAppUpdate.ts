import { useCallback, useEffect, useState } from 'react'
import { fetchUpdateManifest, updateBaseUrl, type UpdateManifest } from '../lib/appUpdate'
import {
  getInstalledAppVersion,
  installNativeUpdate,
  type AppVersion,
} from '../lib/nativeAppActions'
import { isNativeApp } from '../lib/pwaInstall'

export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'up-to-date'
  | 'available'
  | 'downloading'
  | 'installing'
  | 'permission-required'
  | 'unconfigured'
  | 'error'

export function useAppUpdate(options: { checkOnMount?: boolean } = {}) {
  const { checkOnMount = true } = options
  const supported = isNativeApp()
  const [status, setStatus] = useState<UpdateStatus>('idle')
  const [installed, setInstalled] = useState<AppVersion | null>(null)
  const [latest, setLatest] = useState<UpdateManifest | null>(null)
  const [error, setError] = useState<string | null>(null)

  const check = useCallback(async () => {
    if (!supported) return
    if (!updateBaseUrl()) {
      setStatus('unconfigured')
      return
    }
    setStatus('checking')
    setError(null)
    try {
      const [current, manifest] = await Promise.all([getInstalledAppVersion(), fetchUpdateManifest()])
      setInstalled(current)
      setLatest(manifest)
      setStatus(current && manifest.versionCode > current.versionCode ? 'available' : 'up-to-date')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not check for updates')
      setStatus('error')
    }
  }, [supported])

  const install = useCallback(async () => {
    if (!supported || !latest?.apkUrl) return
    setStatus('downloading')
    setError(null)
    try {
      await installNativeUpdate(latest.apkUrl)
      setStatus('installing')
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      if (message.includes('permission-required')) {
        setStatus('permission-required')
        return
      }
      setError(message.replace(/^.*?:\s*/, '') || 'Update failed')
      setStatus('error')
    }
  }, [supported, latest])

  useEffect(() => {
    if (!supported) return
    void getInstalledAppVersion().then(setInstalled)
    if (checkOnMount) void check()
  }, [supported, checkOnMount, check])

  return { supported, status, installed, latest, error, check, install }
}
