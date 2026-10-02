import { ANDROID_APK_URL } from './androidApk'

/**
 * Published next to the APK (public/downloads/version.json) by
 * `npm run apk:publish`. The installed app compares `versionCode` with its own.
 */
export interface UpdateManifest {
  versionCode: number
  versionName: string
  apkUrl?: string
  notes?: string
  publishedAt?: string
}

/**
 * Base URL of the deployed website, used by the installed app to look for
 * updates. Falls back to the API URL since both live on the same deployment.
 */
/** Public copy of public/downloads, used when no deploy URL is configured. */
const DEFAULT_UPDATE_BASE =
  'https://github.com/arjunnbharath/OneMoreRep/raw/main/public'

export function updateBaseUrl(): string {
  const explicit = import.meta.env.VITE_APP_UPDATE_URL as string | undefined
  const api = import.meta.env.VITE_API_URL as string | undefined
  return (explicit || api || DEFAULT_UPDATE_BASE).replace(/\/$/, '')
}

export function resolveUpdateUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  const base = updateBaseUrl()
  if (!base) return path
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`
}

export const UPDATE_MANIFEST_URL = resolveUpdateUrl('/downloads/version.json')

export async function fetchUpdateManifest(): Promise<UpdateManifest> {
  const response = await fetch(`${UPDATE_MANIFEST_URL}?t=${Date.now()}`, { cache: 'no-store' })
  if (!response.ok) throw new Error(`Update check failed (${response.status})`)
  const data = (await response.json()) as Partial<UpdateManifest>
  if (typeof data.versionCode !== 'number' || typeof data.versionName !== 'string') {
    throw new Error('Invalid update manifest')
  }
  return {
    versionCode: data.versionCode,
    versionName: data.versionName,
    apkUrl: resolveUpdateUrl(data.apkUrl || ANDROID_APK_URL),
    notes: data.notes,
    publishedAt: data.publishedAt,
  }
}
