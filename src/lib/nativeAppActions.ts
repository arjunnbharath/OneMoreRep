import { registerPlugin } from '@capacitor/core'
import { isNativeApp } from './pwaInstall'

interface AppActionsPlugin {
  getVersion: () => Promise<{ versionName: string; versionCode: number }>
  uninstall: () => Promise<void>
  installUpdate: (options: { url: string }) => Promise<void>
  vibrate: (options: { pattern: string }) => Promise<void>
}

const AppActions = registerPlugin<AppActionsPlugin>('AppActions')

export interface AppVersion {
  versionName: string
  versionCode: number
}

/** Version of the installed Android app, or null on the web. */
export async function getInstalledAppVersion(): Promise<AppVersion | null> {
  if (!isNativeApp()) return null
  try {
    return await AppActions.getVersion()
  } catch {
    return null
  }
}

/** Opens the Android system dialog to uninstall this app. */
export async function uninstallNativeApp() {
  if (!isNativeApp()) return
  await AppActions.uninstall()
}

/**
 * Downloads the APK at `url` and opens the Android installer.
 * Rejects with "permission-required" when the user first has to allow
 * "Install unknown apps" for OneMoreRep (the settings page is opened for them).
 */
/** Native vibration in the installed app. Falls back to the browser API. */
export async function vibratePhone(pattern: number[]) {
  const waveform = pattern.join(',')
  if (isNativeApp()) {
    try {
      await AppActions.vibrate({ pattern: waveform })
      return
    } catch {
      // WebView fallback below.
    }
  }
  try {
    navigator.vibrate?.(pattern)
  } catch {
    // Vibration is unavailable.
  }
}

export async function installNativeUpdate(url: string) {
  if (!isNativeApp()) return
  await AppActions.installUpdate({ url })
}
