import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.onemorerep.app',
  appName: 'OneMoreRep',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#000000',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DEFAULT',
      overlaysWebView: true,
      backgroundColor: '#00000000',
    },
    SystemBars: {
      // MainActivity publishes --safe-area-inset-* itself and never pads the WebView.
      insetsHandling: 'disable',
    },
  },
}

export default config
