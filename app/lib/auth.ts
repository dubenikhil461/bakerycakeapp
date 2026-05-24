import { createAuthClient } from 'better-auth/vue'
import { emailOTPClient } from "better-auth/client/plugins"


export const authClient = createAuthClient({
    baseURL: useRuntimeConfig().public.apiBase as string || 'http://localhost:7021',
    plugins: [
        emailOTPClient() 
    ]
})

export const useAuth = () => {
    return {
        client: authClient,
        emailOtp: authClient.emailOtp,
        signIn: authClient.signIn,
        signUp: authClient.signUp,
        useSession: authClient.useSession,
    }
}