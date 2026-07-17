import { StrictMode, useEffect, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import { App as CapApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'
import './index.css'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { initPwaInstallListener, registerServiceWorker } from './lib/pwaInstall'

const isNative = Capacitor.isNativePlatform()
const Router = isNative ? HashRouter : BrowserRouter

if (!isNative) {
  initPwaInstallListener()
  registerServiceWorker()
}

function NativeShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!isNative) return

    void StatusBar.setStyle({ style: Style.Default })
    void SplashScreen.hide()

    document.documentElement.classList.add('native-app')
    document.body.classList.add('native-app')

    const backSub = CapApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back()
        return
      }
      void CapApp.exitApp()
    })

    return () => {
      void backSub.then((sub) => sub.remove())
    }
  }, [])

  return children
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <NativeShell>
        <ThemeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemeProvider>
      </NativeShell>
    </Router>
  </StrictMode>,
)
