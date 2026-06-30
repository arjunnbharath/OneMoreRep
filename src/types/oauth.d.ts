interface GoogleCredentialResponse {
  credential: string
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string
    callback: (response: GoogleCredentialResponse) => void
  }) => void
  renderButton: (
    parent: HTMLElement,
    options: {
      type?: string
      theme?: string
      size?: string
      text?: string
      width?: number
    },
  ) => void
}

interface AppleSignInResponse {
  authorization: {
    id_token: string
  }
  user?: {
    name?: {
      firstName?: string
      lastName?: string
    }
  }
}

interface AppleAuth {
  init: (config: {
    clientId: string
    scope: string
    redirectURI: string
    usePopup: boolean
  }) => void
  signIn: () => Promise<AppleSignInResponse>
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId
      }
    }
    AppleID?: {
      auth: AppleAuth
    }
  }
}

export {}
