<script setup lang="ts">
import { authClient } from '~/lib/auth'

const { data: session } = await authClient.getSession()
const user = computed(() => (session as any)?.user)
const sidebarOpen = ref(false)
const route = useRoute()

watch(() => route.path, () => {
  sidebarOpen.value = false
})

async function signOut() {
  await authClient.signOut()
  navigateTo('/')
}

const navLinks = [
  { to: '/admin', icon: '📊', label: 'Dashboard', exact: true },
  { to: '/admin/cakes', icon: '🎂', label: 'Cakes' },
  { to: '/admin/categories', icon: '🏷️', label: 'Categories' },
  { to: '/admin/orders', icon: '📦', label: 'Orders' },
  { to: '/admin/reviews', icon: '⭐', label: 'Reviews' },
  { to: '/admin/users', icon: '👥', label: 'Users' },
]
</script>

<template>
  <div class="tw:flex tw:min-h-screen tw:bg-deep tw:font-raleway tw:text-cream">

    <!-- Mobile overlay -->
    <div
      v-if="sidebarOpen"
      class="tw:fixed tw:inset-0 tw:z-70 tw:bg-black/50 tw:lg:hidden"
      @click="sidebarOpen = false"
    />

    <!-- Sidebar -->
    <aside
      :class="[
        'tw:fixed tw:top-0 tw:left-0 tw:bottom-0 tw:z-80 tw:w-60 tw:bg-[#080e1a] tw:border-r tw:border-gold/10 tw:flex tw:flex-col tw:transition-transform tw:duration-300',
        sidebarOpen ? 'tw:translate-x-0' : 'tw:-translate-x-full',
        'tw:lg:translate-x-0',
      ]"
    >
      <!-- Logo -->
      <div class="tw:px-5 tw:py-5 tw:border-b tw:border-gold/10">
        <NuxtLink to="/" class="tw:font-playfair tw:text-lg tw:text-gold tw:no-underline">🎂 Shivragi Admin</NuxtLink>
      </div>

      <!-- Nav -->
      <nav class="tw:flex-1 tw:px-3 tw:py-4 tw:space-y-1 tw:overflow-y-auto">
        <AdminSidebarLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          :icon="link.icon"
          :label="link.label"
          :exact="link.exact"
        />
      </nav>

      <!-- User -->
      <div class="tw:px-4 tw:py-4 tw:border-t tw:border-gold/10">
        <div class="tw:flex tw:items-center tw:gap-3">
          <div class="tw:w-8 tw:h-8 tw:rounded-full tw:bg-gold/20 tw:flex tw:items-center tw:justify-center tw:text-sm tw:font-playfair tw:text-gold">
            {{ user?.name?.[0]?.toUpperCase() ?? '?' }}
          </div>
          <div class="tw:flex-1 tw:min-w-0">
            <p class="tw:text-xs tw:font-semibold tw:text-cream tw:truncate">{{ user?.name }}</p>
            <p class="tw:text-xs tw:text-white/35">Admin</p>
          </div>
          <button class="tw:text-white/30 tw:hover:text-red-400 tw:transition-colors tw:text-sm" title="Sign out" @click="signOut">⏻</button>
        </div>
      </div>
    </aside>

    <!-- Main area -->
    <div class="tw:flex-1 tw:flex tw:flex-col tw:lg:ml-60">
      <!-- Top bar -->
      <header class="tw:sticky tw:top-0 tw:z-60 tw:bg-deep/90 tw:backdrop-blur-md tw:border-b tw:border-gold/10 tw:flex tw:items-center tw:gap-3 tw:px-4 tw:py-3 tw:lg:px-6">
        <button
          class="tw:lg:hidden tw:text-white/60 tw:hover:text-cream tw:transition-colors tw:text-xl"
          @click="sidebarOpen = !sidebarOpen"
        >
          ☰
        </button>
        <NuxtLink to="/" class="tw:text-xs tw:text-white/35 tw:hover:text-white/55 tw:transition-colors tw:no-underline tw:ml-auto">← Back to site</NuxtLink>
      </header>

      <!-- Page content -->
      <main class="tw:flex-1 tw:p-4 tw:lg:p-8">
        <slot />
      </main>
    </div>

    <AdminToast />
  </div>
</template>
