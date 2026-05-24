<script setup lang="ts">
import { authClient } from '~/lib/auth'

definePageMeta({ ssr: false, middleware: 'auth' })
useHead({ title: 'My Account – Shivragi' })

const router = useRouter()
const { data: session } = await authClient.getSession()
const user = computed(() => (session as any)?.user)

// Quick stats
const { data: ordersData } = await useFetch<{ success: true; data: any[]; meta: { total: number } }>(
  '/api/orders',
  { query: { limit: 1 }, credentials: 'include' },
)
const { data: wishlistData } = await useFetch<{ success: true; data: any[] }>(
  '/api/wishlist',
  { credentials: 'include' },
)

const orderCount = computed(() => (ordersData.value as any)?.meta?.total ?? 0)
const wishlistCount = computed(() => (wishlistData.value as any)?.data?.length ?? 0)
const isAdmin = computed(() => user.value?.role === 'admin')

async function signOut() {
  await authClient.signOut()
  router.push('/')
}
</script>

<template>
  <div class="tw:max-w-2xl tw:mx-auto tw:px-4 tw:md:px-8 tw:py-12">
    <h1 class="tw:font-playfair tw:text-3xl tw:text-gold-light tw:mb-8">My Account</h1>

    <!-- Profile card -->
    <div class="tw:bg-white/4 tw:border tw:border-gold/15 tw:rounded-2xl tw:p-6 tw:mb-6 tw:flex tw:items-center tw:gap-5 tw:flex-wrap">
      <div class="tw:w-16 tw:h-16 tw:rounded-full tw:bg-linear-to-br tw:from-gold/30 tw:to-gold/10 tw:border tw:border-gold/30 tw:flex tw:items-center tw:justify-center tw:text-2xl tw:font-playfair tw:text-gold">
        {{ user?.name?.[0]?.toUpperCase() ?? '?' }}
      </div>
      <div class="tw:flex-1 tw:min-w-0">
        <div class="tw:flex tw:items-center tw:gap-2 tw:flex-wrap">
          <h2 class="tw:font-semibold tw:text-cream tw:text-lg">{{ user?.name }}</h2>
          <span v-if="isAdmin" class="tw:text-xs tw:bg-gold/20 tw:text-gold tw:px-2 tw:py-0.5 tw:rounded-full tw:border tw:border-gold/30">Admin</span>
        </div>
        <p class="tw:text-white/50 tw:text-sm tw:mt-0.5">{{ user?.email }}</p>
      </div>
      <AppButton variant="ghost" size="sm" @click="signOut">Sign Out</AppButton>
    </div>

    <!-- Stats -->
    <div class="tw:grid tw:grid-cols-2 tw:gap-4 tw:mb-6">
      <div class="tw:bg-white/4 tw:border tw:border-gold/10 tw:rounded-2xl tw:p-5 tw:text-center">
        <p class="tw:text-3xl tw:font-playfair tw:text-gold">{{ orderCount }}</p>
        <p class="tw:text-sm tw:text-white/50 tw:mt-1">Orders</p>
      </div>
      <div class="tw:bg-white/4 tw:border tw:border-gold/10 tw:rounded-2xl tw:p-5 tw:text-center">
        <p class="tw:text-3xl tw:font-playfair tw:text-gold">{{ wishlistCount }}</p>
        <p class="tw:text-sm tw:text-white/50 tw:mt-1">Wishlist Items</p>
      </div>
    </div>

    <!-- Nav cards -->
    <div class="tw:space-y-3">
      <NuxtLink
        v-for="link in [
          { to: '/orders', icon: '📦', label: 'My Orders', desc: 'Track and manage your orders' },
          { to: '/addresses', icon: '📍', label: 'Saved Addresses', desc: 'Manage delivery addresses' },
          { to: '/wishlist', icon: '❤️', label: 'Wishlist', desc: 'Cakes you\'ve saved for later' },
        ]"
        :key="link.to"
        :to="link.to"
        class="tw:flex tw:items-center tw:gap-4 tw:p-5 tw:bg-white/4 tw:border tw:border-gold/10 tw:rounded-2xl tw:hover:border-gold/30 tw:transition-all tw:no-underline tw:group"
      >
        <span class="tw:text-2xl">{{ link.icon }}</span>
        <div class="tw:flex-1">
          <p class="tw:font-semibold tw:text-cream tw:group-hover:text-gold tw:transition-colors">{{ link.label }}</p>
          <p class="tw:text-sm tw:text-white/45">{{ link.desc }}</p>
        </div>
        <span class="tw:text-white/30 tw:group-hover:text-gold tw:transition-colors tw:text-lg">→</span>
      </NuxtLink>

      <!-- Admin panel link -->
      <NuxtLink
        v-if="isAdmin"
        to="/admin"
        class="tw:flex tw:items-center tw:gap-4 tw:p-5 tw:bg-gold/8 tw:border tw:border-gold/25 tw:rounded-2xl tw:hover:border-gold/50 tw:transition-all tw:no-underline tw:group"
      >
        <span class="tw:text-2xl">⚙️</span>
        <div class="tw:flex-1">
          <p class="tw:font-semibold tw:text-gold tw:group-hover:text-gold-light tw:transition-colors">Admin Dashboard</p>
          <p class="tw:text-sm tw:text-white/45">Manage cakes, orders, and users</p>
        </div>
        <span class="tw:text-gold/50 tw:group-hover:text-gold tw:transition-colors tw:text-lg">→</span>
      </NuxtLink>
    </div>
  </div>
</template>
