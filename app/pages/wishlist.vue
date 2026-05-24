<script setup lang="ts">
definePageMeta({ ssr: false, middleware: 'auth' })
useHead({ title: 'My Wishlist – Shivragi' })

const { wishlistItems, fetchWishlist, toggleWishlist } = useWishlist()

// Always re-fetch on every visit so deleted/deactivated cakes are never shown
onMounted(fetchWishlist)

async function handleRemove(cakeId: string) {
  await toggleWishlist(cakeId)
}
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
      <div
        v-for="item in wishlistItems"
        :key="item.cake.id"
        class="tw:relative tw:group/wish"
      >
        <AppCakeCard :cake="item.cake" />

        <!-- Remove button — visible on hover -->
        <button
          class="tw:absolute tw:bottom-18 tw:left-1/2 tw:-translate-x-1/2 tw:z-10
                 tw:opacity-0 tw:group-hover/wish:opacity-100 tw:transition-opacity
                 tw:text-xs tw:bg-red-500/80 tw:hover:bg-red-500 tw:text-white
                 tw:px-3 tw:py-1 tw:rounded-full tw:whitespace-nowrap"
          @click.prevent="handleRemove(item.cake.id)"
        >
          ✕ Remove
        </button>
      </div>
    </div>
  </div>
</template>
