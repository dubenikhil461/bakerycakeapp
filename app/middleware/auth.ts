import { authClient } from '~/lib/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const { data: session } = await authClient.getSession()
  if (!session) {
    return navigateTo(`/auth?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
