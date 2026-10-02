import { isNativeApp, isPwaInstalled } from './pwaInstall'

/**
 * Where the installable Android package lives. Defaults to the copy shipped
 * with the web build (public/downloads/OneMoreRep.apk); override with
 * VITE_ANDROID_APK_URL to point at a release host (GitHub Releases, etc.).
 */
/** Latest APK on GitHub. The site download redirects here too. */
export const ANDROID_APK_URL: string =
  (import.meta.env.VITE_ANDROID_APK_URL as string | undefined) ||
  'https://github.com/arjunnbharath/OneMoreRep/raw/main/public/downloads/OneMoreRep.apk'

export const ANDROID_APK_FILENAME = 'OneMoreRep.apk'

export function isAndroidBrowser() {
  if (typeof window === 'undefined') return false
  return /android/i.test(window.navigator.userAgent) && !isNativeApp() && !isPwaInstalled()
}

/** Triggers the APK download; Android then opens the package installer. */
export function downloadAndroidApk() {
  if (typeof document === 'undefined') return
  const link = document.createElement('a')
  link.href = ANDROID_APK_URL
  link.download = ANDROID_APK_FILENAME
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
}
