import { useCallback, useEffect, useState } from 'react'
import {
  canShowBrowserInstall,
  hasInstallPrompt,
  isIosBrowser,
  isNativeApp,
  isPwaInstalled,
  promptPwaInstall,
  subscribePwaInstall,
} from '../lib/pwaInstall'
import { downloadAndroidApk, isAndroidBrowser } from '../lib/androidApk'

export function usePwaInstall() {
  const [installed, setInstalled] = useState(isPwaInstalled)
  const [canInstall, setCanInstall] = useState(hasInstallPrompt)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    return subscribePwaInstall(() => {
      setInstalled(isPwaInstalled())
      setCanInstall(hasInstallPrompt())
    })
  }, [])

  const install = useCallback(async () => {
    setInstalling(true)
    try {
      return await promptPwaInstall()
    } finally {
      setInstalling(false)
      setInstalled(isPwaInstalled())
      setCanInstall(hasInstallPrompt())
    }
  }, [])

  return {
    showInstallSection: !isNativeApp(),
    installed,
    canInstall,
    isIosBrowser: isIosBrowser(),
    isAndroidBrowser: isAndroidBrowser(),
    canShowBrowserInstall: canShowBrowserInstall(),
    installing,
    install,
    downloadApk: downloadAndroidApk,
  }
}
