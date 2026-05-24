<script setup lang="ts">
import { authClient } from '~/lib/auth'

const { data: session } = await authClient.getSession()
const user = computed(() => (session as any)?.user)
const isAdmin = computed(() => user.value?.role === 'admin')

const { itemCount, cartOpen } = useCart()
const { wishlistIds } = useWishlist()
const wishlistCount = computed(() => wishlistIds.value.length)
</script>

<template>
  <header class="tw:fixed tw:top-0 tw:left-0 tw:right-0 tw:z-100 tw:flex tw:items-center tw:justify-between tw:px-5 tw:py-4 tw:md:px-12 tw:md:py-5 tw:bg-deep/75 tw:backdrop-blur-xl tw:border-b tw:border-gold/20">
    <NuxtLink
      to="/"
      class="tw:font-playfair tw:text-2xl tw:font-bold tw:text-gold tw:tracking-wide tw:flex tw:items-center tw:gap-2.5 tw:no-underline"
    >
      🎂 <span class="tw:italic tw:text-gold-light">Shivragi</span> Cake
    </NuxtLink>

    <nav class="tw:flex tw:gap-3 tw:md:gap-5 tw:items-center">
      <NuxtLink
        to="/cakes"
        class="tw:hidden tw:md:inline tw:text-white/75 tw:no-underline tw:text-sm tw:tracking-widest tw:uppercase tw:font-semibold tw:transition-colors tw:hover:text-gold"
      >
        Browse
      </NuxtLink>

      <!-- Wishlist -->
      <NuxtLink
        v-if="user"
        to="/wishlist"
        class="tw:relative tw:text-white/60 tw:hover:text-gold tw:transition-colors tw:no-underline tw:text-xl"
        title="Wishlist"
      >
        ❤️
        <span
          v-if="wishlistCount"
          class="tw:absolute -tw:top-1.5 -tw:right-1.5 tw:w-4 tw:h-4 tw:rounded-full tw:bg-red-500 tw:text-white tw:text-xs tw:font-bold tw:flex tw:items-center tw:justify-center"
        >{{ wishlistCount > 9 ? '9+' : wishlistCount }}</span>
      </NuxtLink>

      <!-- Cart -->
      <button
        class="tw:relative tw:text-white/60 tw:hover:text-gold tw:transition-colors tw:text-xl"
        title="Cart"
        @click="cartOpen = true"
      >
        🛒
        <span
          v-if="itemCount"
          class="tw:absolute -tw:top-1.5 -tw:right-1.5 tw:w-4 tw:h-4 tw:rounded-full tw:bg-gold tw:text-deep tw:text-xs tw:font-bold tw:flex tw:items-center tw:justify-center"
        >{{ itemCount > 9 ? '9+' : itemCount }}</span>
      </button>

      <!-- Account / Sign in -->
      <NuxtLink
        v-if="user"
        :to="isAdmin ? '/admin' : '/account'"
        class="tw:inline-flex tw:bg-linear-to-br tw:from-gold tw:to-[#e0940a] tw:text-deep tw:px-5 tw:py-2 tw:rounded-full tw:font-bold tw:text-xs tw:tracking-widest tw:uppercase tw:no-underline tw:transition-all tw:hover:-translate-y-0.5 tw:shadow-[0_4px_16px_rgba(240,180,41,0.35)]"
      >
        {{ isAdmin ? 'Admin' : 'Account' }}
      </NuxtLink>
      <NuxtLink
        v-else
        to="/auth"
        class="tw:inline-flex tw:bg-linear-to-br tw:from-gold tw:to-[#e0940a] tw:text-deep tw:px-5 tw:py-2 tw:rounded-full tw:font-bold tw:text-xs tw:tracking-widest tw:uppercase tw:no-underline tw:transition-all tw:hover:-translate-y-0.5 tw:shadow-[0_4px_16px_rgba(240,180,41,0.35)]"
      >
        Sign In
      </NuxtLink>
    </nav>
  </header>
</template>
