import { useCallback, useEffect, useState } from 'react'

export type CameraPermissionState = 'unsupported' | 'prompt' | 'granted' | 'denied'

export function isCameraSupported() {
  return typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia)
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

  const request = useCallback(async () => {
    setRequesting(true)
    try {
      const next = await requestCameraPermission()
      setPermission(next)
      return next
    } finally {
      setRequesting(false)
    }
  }, [])

  return {
    supported,
    permission,
    granted: permission === 'granted',
    denied: permission === 'denied',
    requesting,
    request,
    refresh,
  }
}
