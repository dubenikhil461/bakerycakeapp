<script setup lang="ts">
import { authClient } from '~/lib/auth'

onMounted(async () => {
  const { data: session } = await authClient.getSession()
  if (session) {
    await Promise.all([
      useCart().fetchCart(),
      useWishlist().fetchWishlist(),
    ])
  }
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtLoadingIndicator />
    <NuxtPage />
  </NuxtLayout>
</template>
