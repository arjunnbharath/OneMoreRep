import { StrictMode, useEffect, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import './index.css'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

const isNative = Capacitor.isNativePlatform()
const Router = isNative ? HashRouter : BrowserRouter

function NativeShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!isNative) return

    void StatusBar.setStyle({ style: Style.Default })

    document.documentElement.classList.add('native-app')
    document.body.classList.add('native-app')
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
