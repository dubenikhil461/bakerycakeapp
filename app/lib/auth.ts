import { createAuthClient } from 'better-auth/vue'
import { emailOTPClient } from 'better-auth/client/plugins'

let _authClient: ReturnType<typeof createAuthClient> | null = null

function getAuthClient() {
  if (!_authClient) {
    const config = useRuntimeConfig()
    _authClient = createAuthClient({
      baseURL: (config.public.apiBase as string) || 'http://localhost:7021',
      plugins: [emailOTPClient()],
    })
  }
  return _authClient
}

export const useAuth = () => {
  const authClient = getAuthClient()
  return {
    client: authClient,
    emailOtp: authClient.emailOtp,
    signIn: authClient.signIn,
    signUp: authClient.signUp,
    useSession: authClient.useSession,
  }
}
