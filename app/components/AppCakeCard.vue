<script setup lang="ts">
import type { CakeListItem } from '~/types/api'

const props = defineProps<{ cake: CakeListItem }>()
const { addToCart, cartLoading } = useCart()
const { isWishlisted, toggleWishlist } = useWishlist()
const { showToast } = useHomeToast()

// NuxtLink is a Vue component — ref gives us the instance, not the DOM node.
// Use $el to reach the rendered <a> element.
const cardRefRaw = ref<{ $el: HTMLElement } | null>(null)

onMounted(() => {
  const el = cardRefRaw.value?.$el
  if (!el) return
  const obs = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        el.style.opacity = '1'
        el.style.transform = 'translateY(0)'
        obs.disconnect()
      }
    },
    { threshold: 0.1 },
  )
  el.style.opacity = '0'
  el.style.transform = 'translateY(20px)'
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease'
  obs.observe(el)
})


async function handleWishlist(e: Event) {
  e.preventDefault()
  e.stopPropagation()
  await toggleWishlist(props.cake.id)
}

const wishlisted = computed(() => isWishlisted(props.cake.id))
const rating = computed(() => parseFloat(props.cake.avgRating))
</script>

<template>
  <NuxtLink
    ref="cardRefRaw"
    :to="`/cakes/${cake.slug}`"
    class="tw:group tw:relative tw:flex tw:flex-col tw:bg-white/4 tw:border tw:border-gold/10 tw:rounded-2xl tw:overflow-hidden tw:hover:border-gold/30 tw:transition-all tw:no-underline tw:hover:-translate-y-1 tw:hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
  >
    <!-- Image -->
    <div class="tw:relative tw:aspect-square tw:bg-navy tw:overflow-hidden">
      <img
        v-if="cake.primaryImageUrl"
        :src="cake.primaryImageUrl"
        :alt="cake.name"
        class="tw:w-full tw:h-full tw:object-cover tw:transition-transform tw:duration-500 tw:group-hover:scale-105"
      />
      <div v-else class="tw:w-full tw:h-full tw:flex tw:items-center tw:justify-center tw:text-6xl">🎂</div>

      <!-- Badges -->
      <div class="tw:absolute tw:top-3 tw:left-3 tw:flex tw:flex-col tw:gap-1">
        <span v-if="cake.isFeatured" class="tw:text-xs tw:bg-gold tw:text-deep tw:px-2 tw:py-0.5 tw:rounded-full tw:font-bold">Featured</span>
      </div>

      <!-- Wishlist heart -->
      <button
        class="tw:absolute tw:top-3 tw:right-3 tw:w-8 tw:h-8 tw:rounded-full tw:bg-black/40 tw:backdrop-blur-sm tw:flex tw:items-center tw:justify-center tw:transition-all tw:hover:bg-black/60"
        :class="wishlisted ? 'tw:text-red-400' : 'tw:text-white/50'"
        @click="handleWishlist"
      >
        {{ wishlisted ? '❤️' : '🤍' }}
      </button>
    </div>

    <!-- Content -->
    <div class="tw:flex tw:flex-col tw:flex-1 tw:p-4 tw:gap-2">
      <div v-if="cake.category" class="tw:text-xs tw:text-gold/60 tw:uppercase tw:tracking-wider">{{ cake.category.name }}</div>
      <h3 class="tw:font-semibold tw:text-cream tw:leading-snug tw:line-clamp-2 tw:group-hover:text-gold tw:transition-colors">{{ cake.name }}</h3>

      <div class="tw:flex tw:items-center tw:gap-1.5 tw:mt-auto">
        <AppRatingStars :value="rating" size="sm" />
        <span class="tw:text-xs tw:text-white/35">({{ cake.reviewCount }})</span>
      </div>
    </div>
  </NuxtLink>
</template>
