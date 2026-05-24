import { createAuthClient } from 'better-auth/vue'
import { emailOTPClient } from 'better-auth/client/plugins'

type AuthClient = ReturnType<typeof createAuthClient>

let _authClient: AuthClient | null = null

/** Called once by the auth Nuxt plugin — never call this directly in components. */
export function initAuthClient(baseURL: string) {
  if (_authClient) return
  _authClient = createAuthClient({
    baseURL,
    plugins: [emailOTPClient()],
  })
}

export const useAuth = () => {
  if (!_authClient) {
    throw new Error('[auth] Client not initialised — is plugins/auth.ts loaded?')
  }
  return {
    client: _authClient,
    emailOtp: _authClient.emailOtp,
    signIn: _authClient.signIn,
    signUp: _authClient.signUp,
    useSession: _authClient.useSession,
  }
}
