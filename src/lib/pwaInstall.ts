import { Capacitor } from '@capacitor/core'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type InstallListener = () => void

let deferredPrompt: BeforeInstallPromptEvent | null = null
const listeners = new Set<InstallListener>()

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

export function isNativeApp() {
  return Capacitor.isNativePlatform()
}

export function isPwaInstalled() {
  if (typeof window === 'undefined') return false

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function isIosBrowser() {
  if (typeof window === 'undefined') return false

  const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent)
  return isIos && !isPwaInstalled()
}

export function canShowBrowserInstall() {
  return !isNativeApp() && !isPwaInstalled()
}

export function initPwaInstallListener() {
  if (typeof window === 'undefined' || isNativeApp()) return

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPrompt = event as BeforeInstallPromptEvent
    notifyListeners()
  })

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    notifyListeners()
  })
}

export function subscribePwaInstall(listener: InstallListener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function hasInstallPrompt() {
  return deferredPrompt !== null
}

export async function promptPwaInstall() {
  if (!deferredPrompt) return false

  await deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  deferredPrompt = null
  notifyListeners()

  return outcome === 'accepted'
}

export function registerServiceWorker() {
  if (typeof window === 'undefined' || isNativeApp() || !('serviceWorker' in navigator)) return

  const swUrl = `${import.meta.env.BASE_URL}sw.js`

  window.addEventListener('load', () => {
    void navigator.serviceWorker.register(swUrl).catch(() => {
      // Install prompt may still work from the browser menu on supported platforms.
    })
  })
}
