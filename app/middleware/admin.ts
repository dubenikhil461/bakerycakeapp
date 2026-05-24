import { authClient } from '~/lib/auth'

export default defineNuxtRouteMiddleware(async () => {
  const { data: session } = await authClient.getSession()

  // Not logged in at all — auth middleware handles this, but double-check
  if (!session?.user) {
    return navigateTo('/')
  }

  // Logged in but not admin
  if ((session.user as any).role !== 'admin') {
    // Throw a 403 so the error page shows "Forbidden" instead of silently redirecting
    throw createError({ statusCode: 403, statusMessage: 'Forbidden — Admin access only' })
  }
})
