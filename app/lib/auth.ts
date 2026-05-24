import { createAuthClient } from 'better-auth/vue'

type AuthClient = ReturnType<typeof createAuthClient>

let client: AuthClient | null = null

function getClient(): AuthClient {
  if (!client) {
    const config = useRuntimeConfig()
    client = createAuthClient({
      baseURL: config.public.apiBase as string,
    })
  }
  return client
}

/** Auth helpers — client-only; safe to call from event handlers. */
export function useAuth() {
  if (import.meta.server) {
    throw new Error('useAuth() must only be used on the client')
  }

  const c = getClient()
  return {
    signIn: c.signIn,
    signUp: c.signUp,
    signOut: c.signOut,
    useSession: c.useSession,
  }
}
