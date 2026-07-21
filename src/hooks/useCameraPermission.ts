import { useCallback, useEffect, useState } from 'react'

export type CameraPermissionState = 'unsupported' | 'prompt' | 'granted' | 'denied'

const CAMERA_ENABLED_KEY = 'onemorerep-camera-enabled'
const CAMERA_CHANGED_EVENT = 'onemorerep-camera-changed'

export function isCameraSupported() {
  return typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia)
}

function readCameraEnabled() {
  return localStorage.getItem(CAMERA_ENABLED_KEY) === 'true'
}

function writeCameraEnabled(enabled: boolean) {
  localStorage.setItem(CAMERA_ENABLED_KEY, String(enabled))
  window.dispatchEvent(new CustomEvent(CAMERA_CHANGED_EVENT, { detail: { enabled } }))
}

export async function queryCameraPermission(): Promise<CameraPermissionState> {
  if (!isCameraSupported()) return 'unsupported'

  try {
    const result = await navigator.permissions.query({ name: 'camera' as PermissionName })
    return result.state as CameraPermissionState
  } catch {
    return 'prompt'
  }
}

export async function requestCameraPermission(): Promise<CameraPermissionState> {
  if (!isCameraSupported()) return 'unsupported'

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false,
    })
    stream.getTracks().forEach((track) => track.stop())
    return 'granted'
  } catch {
    return 'denied'
  }
}

export function useCameraPermission() {
  const [supported] = useState(isCameraSupported)
  const [permission, setPermission] = useState<CameraPermissionState>('prompt')
  const [enabled, setEnabled] = useState(readCameraEnabled)
  const [requesting, setRequesting] = useState(false)

  const refresh = useCallback(async () => {
    setPermission(await queryCameraPermission())
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!supported) return

    let disposed = false
    let status: PermissionStatus | null = null

    navigator.permissions
      .query({ name: 'camera' as PermissionName })
      .then((result) => {
        if (disposed) return
        status = result
        setPermission(result.state as CameraPermissionState)
        result.onchange = () => {
          setPermission(result.state as CameraPermissionState)
        }
      })
      .catch(() => {
        if (!disposed) setPermission('prompt')
      })

    return () => {
      disposed = true
      if (status) status.onchange = null
    }
  }, [supported])

  useEffect(() => {
    function handleCameraChanged(event: Event) {
      const detail = (event as CustomEvent<{ enabled: boolean }>).detail
      if (detail && typeof detail.enabled === 'boolean') {
        setEnabled(detail.enabled)
      } else {
        setEnabled(readCameraEnabled())
      }
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === CAMERA_ENABLED_KEY) {
        setEnabled(readCameraEnabled())
      }
    }

    window.addEventListener(CAMERA_CHANGED_EVENT, handleCameraChanged)
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener(CAMERA_CHANGED_EVENT, handleCameraChanged)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const enable = useCallback(async () => {
    if (!supported) return 'unsupported' as const
    if (permission === 'denied') return 'denied' as const

    setRequesting(true)
    try {
      let next: CameraPermissionState = permission
      if (permission !== 'granted') {
        next = await requestCameraPermission()
        setPermission(next)
      }
      if (next === 'granted') {
        writeCameraEnabled(true)
        setEnabled(true)
      }
      return next
    } finally {
      setRequesting(false)
    }
  }, [permission, supported])

  const disable = useCallback(() => {
    writeCameraEnabled(false)
    setEnabled(false)
  }, [])

  const active = enabled && permission === 'granted'

  return {
    supported,
    permission,
    enabled,
    active,
    granted: active,
    denied: permission === 'denied',
    requesting,
    enable,
    disable,
    request: enable,
    refresh,
  }
}
