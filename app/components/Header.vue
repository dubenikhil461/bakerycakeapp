<template>
  <header class="tw:fixed tw:top-0 tw:left-0 tw:right-0 tw:z-[100] tw:flex tw:items-center tw:justify-between tw:px-5 tw:py-4 tw:md:px-12 tw:md:py-5 tw:bg-deep/75 tw:backdrop-blur-xl tw:border-b tw:border-gold/20">
    <NuxtLink
      to="/"
      class="tw:font-playfair tw:text-2xl tw:font-bold tw:text-gold tw:tracking-wide tw:flex tw:items-center tw:gap-2.5 tw:no-underline"
    >
      🎂 <span class="tw:italic tw:text-gold-light">Shivragi</span> Cake
    </NuxtLink>
    <nav class="tw:flex tw:gap-4 tw:md:gap-9 tw:items-center">
      <NuxtLink
        to="/#catalog"
        class="tw:hidden tw:md:inline tw:text-white/75 tw:no-underline tw:text-sm tw:tracking-widest tw:uppercase tw:font-semibold tw:transition-colors tw:hover:text-gold"
      >
        Catalog
      </NuxtLink>
      <NuxtLink
        :to="session ? '/dashboard' : '/auth'"
        class="tw:inline-flex tw:bg-gradient-to-br tw:from-gold tw:to-[#e0940a] tw:text-deep tw:px-6 tw:py-2 tw:rounded-full tw:font-bold tw:text-xs tw:tracking-widest tw:uppercase tw:no-underline tw:transition-all tw:hover:-translate-y-0.5 tw:shadow-[0_4px_16px_rgba(240,180,41,0.35)] tw:hover:shadow-[0_8px_24px_rgba(240,180,41,0.5)]"
      >
        {{ session ? 'Dashboard' : 'Sign In' }}
      </NuxtLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { authClient } from "~/lib/auth"

const { data: session } = await authClient.getSession()
console.log(session)
</script>