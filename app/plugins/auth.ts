import { initAuthClient } from '~/lib/auth'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  initAuthClient((config.public.apiBase as string) || 'http://localhost:7021')
})
