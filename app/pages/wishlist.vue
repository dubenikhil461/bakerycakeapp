<script setup lang="ts">
definePageMeta({ ssr: false, middleware: 'auth' })
useHead({ title: 'My Wishlist – Shivragi' })

const { wishlistItems, fetchWishlist } = useWishlist()

// wishlistItems comes from the composable; ensure fresh data
await fetchWishlist()
</script>

<template>
  <div class="tw:max-w-5xl tw:mx-auto tw:px-4 tw:md:px-8 tw:py-12">
    <div class="tw:flex tw:items-center tw:gap-3 tw:mb-8">
      <button class="tw:text-xs tw:text-white/40 tw:hover:text-white/60 tw:transition-colors" @click="$router.push('/account')">← My Account</button>
    </div>
    <h1 class="tw:font-playfair tw:text-3xl tw:text-gold-light tw:mb-8">My Wishlist</h1>

    <AppEmptyState
      v-if="!wishlistItems?.length"
      icon="❤️"
      title="Your wishlist is empty"
      description="Save cakes you love and find them here easily."
      action-label="Browse Cakes"
      action-to="/cakes"
    />

    <div v-else class="tw:grid tw:grid-cols-1 tw:sm:grid-cols-2 tw:xl:grid-cols-3 tw:gap-5">
      <AppCakeCard
        v-for="item in wishlistItems"
        :key="item.cakeId"
        :cake="item.cake"
      />
    </div>
  </div>
</template>
