import { createAuthClient } from "better-auth/client"
import { emailOTPClient } from "better-auth/client/plugins"

type AuthClient = ReturnType<typeof createAuthClient>

let _authClient: AuthClient | null = null

/**
 * Lazily creates the better-auth client the first time it is accessed.
 * Must be called from within a Vue setup function, Nuxt plugin, middleware,
 * or hook — i.e. anywhere the Nuxt instance is already available.
 */
function initAuthClient(): AuthClient {
    if (!_authClient) {
        const config = useRuntimeConfig()
        _authClient = createAuthClient({
            baseURL: (config.public.apiBase as string) || 'http://localhost:7021',
            plugins: [
                emailOTPClient(),
            ],
        })
    }
    return _authClient
}

/**
 * A transparent proxy over the real auth client.
 * Any property/method access triggers lazy initialisation, so this can be
 * imported at module level without causing a "called outside of Nuxt context"
 * error.
 */
export const authClient = new Proxy({} as AuthClient, {
    get(_target, prop: string | symbol) {
        return (initAuthClient() as any)[prop]
    },
})

export const useAuth = () => {
    const client = initAuthClient()
    return {
        client,
        emailOtp: client.emailOtp,
        signIn:   client.signIn,
        signUp:   client.signUp,
        useSession: client.useSession,
    }
}
