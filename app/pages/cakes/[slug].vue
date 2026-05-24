<script setup lang="ts">
import type { CakeDetail, CakeVariant, Review, PaginatedResponse } from '~/types/api'

definePageMeta({ ssr: false })

const route = useRoute()
const slug = route.params.slug as string

const { data: cakeRes, error } = await useFetch<{ success: true; data: CakeDetail }>(
  `/api/cakes/${slug}`,
  { credentials: 'include' },
)

if (error.value || !cakeRes.value?.data) {
  throw createError({ statusCode: 404, message: 'Cake not found' })
}

const cake = computed(() => cakeRes.value!.data)

useHead(() => ({
  title: `${cake.value.name} – Shivragi Cake`,
  meta: [{ name: 'description', content: cake.value.shortDescription ?? cake.value.name }],
}))

// ─── Image gallery ────────────────────────────────────────────────────────────
const activeImage = ref(cake.value.images.find(i => i.isPrimary) ?? cake.value.images[0])

// ─── Variant picker ───────────────────────────────────────────────────────────
const variantGroups = computed(() => {
  const groups: Record<string, CakeVariant[]> = {}
  for (const v of cake.value.variants.filter(v => v.isActive)) {
    if (!groups[v.variantType]) groups[v.variantType] = []
    groups[v.variantType].push(v)
  }
  return groups
})

const selectedVariants = ref<Record<string, CakeVariant>>({})

watch(() => cake.value.variants, (variants) => {
  const groups: Record<string, CakeVariant> = {}
  for (const v of variants.filter(v => v.isActive)) {
    if (!groups[v.variantType]) groups[v.variantType] = v
  }
  selectedVariants.value = groups
}, { immediate: true })

const effectivePrice = computed(() => {
  let price = parseFloat(cake.value.basePrice)
  for (const v of Object.values(selectedVariants.value)) {
    price += parseFloat(v.priceModifier)
  }
  return price
})

const primaryVariant = computed(() => Object.values(selectedVariants.value)[0] ?? null)

// ─── Add to cart ──────────────────────────────────────────────────────────────
const { addToCart } = useCart()
const quantity = ref(1)
const customMessage = ref('')
const deliveryDate = ref('')
const addingToCart = ref(false)
const { showToast } = useHomeToast()

async function handleAddToCart() {
  addingToCart.value = true
  try {
    await addToCart({
      cakeId: cake.value.id,
      variantId: primaryVariant.value?.id ?? null,
      quantity: quantity.value,
      customMessage: customMessage.value || undefined,
      deliveryDate: deliveryDate.value || undefined,
    })
    showToast(`🎂 ${cake.value.name} added to cart!`)
  } catch (e: any) {
    showToast(e?.data?.error ?? 'Failed to add to cart')
  } finally {
    addingToCart.value = false
  }
}

// ─── Reviews ──────────────────────────────────────────────────────────────────
const reviewPage = ref(1)
const { data: reviewsData, refresh: refreshReviews } = await useFetch<PaginatedResponse<Review>>(
  '/api/reviews',
  {
    query: computed(() => ({ cakeId: cake.value.id, page: reviewPage.value, limit: 10 })),
    credentials: 'include',
    watch: [reviewPage],
  },
)

const reviews = computed<Review[]>(() => (reviewsData.value as any)?.data ?? [])
const reviewMeta = computed(() => (reviewsData.value as any)?.meta)

const showReviewModal = ref(false)
const existingReview = ref<Review | undefined>()

const { data: session } = await import('~/lib/auth').then(m => m.authClient.getSession())

const userReview = computed(() =>
  reviews.value.find(r => r.userId === (session as any)?.user?.id),
)

function onReviewSaved() {
  showReviewModal.value = false
  existingReview.value = undefined
  reviewPage.value = 1
  refreshReviews()
}

async function deleteMyReview() {
  if (!userReview.value) return
  await $fetch(`/api/reviews/${userReview.value.id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  refreshReviews()
}

const minDeliveryDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
})
</script>

<template>
  <div class="tw:max-w-6xl tw:mx-auto tw:px-4 tw:md:px-8 tw:py-12">
    <!-- Breadcrumb -->
    <nav class="tw:flex tw:items-center tw:gap-2 tw:text-sm tw:text-white/40 tw:mb-8">
      <NuxtLink to="/" class="tw:hover:text-white/70 tw:transition-colors tw:no-underline">Home</NuxtLink>
      <span>/</span>
      <NuxtLink to="/cakes" class="tw:hover:text-white/70 tw:transition-colors tw:no-underline">Cakes</NuxtLink>
      <span>/</span>
      <span class="tw:text-white/70">{{ cake.name }}</span>
    </nav>

    <div class="tw:grid tw:grid-cols-1 tw:lg:grid-cols-2 tw:gap-12">
      <!-- Left: Image gallery -->
      <div>
        <div class="tw:aspect-square tw:rounded-2xl tw:overflow-hidden tw:bg-navy tw:border tw:border-gold/15 tw:mb-3">
          <img
            v-if="activeImage?.url"
            :src="activeImage.url"
            :alt="activeImage.altText ?? cake.name"
            class="tw:w-full tw:h-full tw:object-cover"
          />
          <div v-else class="tw:w-full tw:h-full tw:flex tw:items-center tw:justify-center tw:text-8xl">🎂</div>
        </div>
        <div v-if="cake.images.length > 1" class="tw:flex tw:gap-2 tw:overflow-x-auto">
          <button
            v-for="img in cake.images"
            :key="img.id"
            :class="[
              'tw:w-16 tw:h-16 tw:rounded-xl tw:overflow-hidden tw:border-2 tw:shrink-0 tw:transition-all',
              activeImage?.id === img.id ? 'tw:border-gold' : 'tw:border-gold/20 tw:hover:border-gold/50',
            ]"
            @click="activeImage = img"
          >
            <img :src="img.url" :alt="img.altText ?? ''" class="tw:w-full tw:h-full tw:object-cover" />
          </button>
        </div>
      </div>

      <!-- Right: Details -->
      <div class="tw:space-y-5">
        <div v-if="cake.category" class="tw:text-xs tw:text-gold/70 tw:uppercase tw:tracking-widest">
          {{ cake.category.name }}
        </div>

        <div>
          <h1 class="tw:font-playfair tw:text-3xl tw:md:text-4xl tw:text-cream tw:mb-2">{{ cake.name }}</h1>
          <div class="tw:flex tw:items-center tw:gap-2">
            <AppRatingStars :value="parseFloat(cake.avgRating)" size="md" />
            <span class="tw:text-white/50 tw:text-sm">({{ cake.reviewCount }} reviews)</span>
          </div>
        </div>

        <div class="tw:font-cormorant tw:text-4xl tw:text-gold tw:font-semibold">
          ₹{{ effectivePrice.toFixed(0) }}
        </div>

        <p v-if="cake.shortDescription" class="tw:text-white/65 tw:text-sm tw:leading-relaxed">
          {{ cake.shortDescription }}
        </p>

        <!-- Variant pickers -->
        <div v-for="(variants, type) in variantGroups" :key="type" class="tw:space-y-2">
          <label class="tw:text-xs tw:text-white/40 tw:uppercase tw:tracking-wider tw:capitalize">{{ type }}</label>
          <div class="tw:flex tw:flex-wrap tw:gap-2">
            <button
              v-for="v in variants"
              :key="v.id"
              :class="[
                'tw:px-3 tw:py-1.5 tw:rounded-full tw:border tw:text-sm tw:transition-all',
                selectedVariants[type]?.id === v.id
                  ? 'tw:border-gold tw:bg-gold/15 tw:text-gold'
                  : 'tw:border-gold/25 tw:text-white/60 tw:hover:border-gold/50',
              ]"
              @click="selectedVariants[type] = v"
            >
              {{ v.name }}
              <span v-if="parseFloat(v.priceModifier) !== 0" class="tw:text-xs tw:opacity-70">
                {{ parseFloat(v.priceModifier) > 0 ? '+' : '' }}₹{{ parseFloat(v.priceModifier).toFixed(0) }}
              </span>
            </button>
          </div>
        </div>

        <!-- Quantity -->
        <div class="tw:flex tw:items-center tw:gap-4">
          <label class="tw:text-xs tw:text-white/40 tw:uppercase tw:tracking-wider">Quantity</label>
          <div class="tw:flex tw:items-center tw:gap-2 tw:bg-white/6 tw:rounded-full tw:px-1 tw:border tw:border-gold/15">
            <button class="tw:w-8 tw:h-8 tw:flex tw:items-center tw:justify-center tw:hover:text-gold tw:transition-colors" @click="quantity = Math.max(1, quantity - 1)">−</button>
            <span class="tw:w-8 tw:text-center tw:font-semibold">{{ quantity }}</span>
            <button class="tw:w-8 tw:h-8 tw:flex tw:items-center tw:justify-center tw:hover:text-gold tw:transition-colors" @click="quantity = Math.min(10, quantity + 1)">+</button>
          </div>
        </div>

        <!-- Custom message -->
        <div>
          <label class="tw:block tw:text-xs tw:text-white/40 tw:uppercase tw:tracking-wider tw:mb-1.5">Custom Message </label>
          <input
            v-model="customMessage"
            required
            maxlength="300"
            placeholder="e.g. Happy Birthday Rahul! 🎂"
            class="tw:w-full tw:bg-white/5 tw:border tw:border-gold/20 tw:rounded-xl tw:px-4 tw:py-2.5 tw:text-cream tw:placeholder-white/25 tw:focus:outline-none tw:focus:border-gold/50 tw:text-sm"
          />
        </div>

        <!-- Delivery date -->
        <div>
          <label class="tw:block tw:text-xs tw:text-white/40 tw:uppercase tw:tracking-wider tw:mb-1.5">Delivery Date</label>
          <input
            v-model="deliveryDate"
            type="date"
            :min="minDeliveryDate"
            required
            class="tw:bg-white/5 tw:border tw:border-gold/20 tw:rounded-xl tw:px-4 tw:py-2.5 tw:text-cream tw:focus:outline-none tw:focus:border-gold/50 tw:text-sm"
          />
        </div>

        <AppButton variant="gold" size="lg" :loading="addingToCart" class="tw:w-full" @click="handleAddToCart">
          Add to Cart →
        </AppButton>

        <!-- Tags -->
        <div v-if="cake.tags.length" class="tw:flex tw:flex-wrap tw:gap-2 tw:pt-2">
          <NuxtLink
            v-for="tag in cake.tags"
            :key="tag.id"
            :to="`/cakes?tag=${tag.slug}`"
            class="tw:px-3 tw:py-1 tw:rounded-full tw:bg-white/5 tw:text-white/40 tw:text-xs tw:hover:text-white/70 tw:hover:bg-white/8 tw:transition-all tw:no-underline"
          >
            #{{ tag.name }}
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Reviews section -->
    <div class="tw:mt-16 tw:pt-12 tw:border-t tw:border-gold/10">
      <div class="tw:flex tw:items-center tw:justify-between tw:mb-8">
        <h2 class="tw:font-playfair tw:text-2xl tw:text-gold-light">
          Customer Reviews
          <span v-if="reviewMeta" class="tw:text-lg tw:text-white/40 tw:ml-2">({{ reviewMeta.total }})</span>
        </h2>
        <div class="tw:flex tw:gap-2">
          <AppButton
            v-if="session && !userReview"
            variant="outline"
            size="sm"
            @click="showReviewModal = true; existingReview = undefined"
          >
            Write a Review
          </AppButton>
          <template v-if="userReview">
            <AppButton variant="ghost" size="sm" @click="showReviewModal = true; existingReview = userReview">Edit My Review</AppButton>
            <AppButton variant="danger" size="sm" @click="deleteMyReview">Delete</AppButton>
          </template>
        </div>
      </div>

      <div v-if="reviews.length" class="tw:space-y-5">
        <div
          v-for="r in reviews"
          :key="r.id"
          class="tw:bg-white/4 tw:border tw:border-gold/10 tw:rounded-2xl tw:p-5"
        >
          <div class="tw:flex tw:items-start tw:justify-between tw:gap-4 tw:mb-2">
            <div>
              <AppRatingStars :value="r.rating" size="sm" />
              <p v-if="r.title" class="tw:font-semibold tw:text-cream tw:mt-1">{{ r.title }}</p>
            </div>
            <div class="tw:text-right tw:shrink-0">
              <span v-if="r.isVerifiedPurchase" class="tw:text-xs tw:text-emerald-400 tw:bg-emerald-500/15 tw:px-2 tw:py-0.5 tw:rounded-full">✓ Verified</span>
              <p class="tw:text-white/30 tw:text-xs tw:mt-1">{{ new Date(r.createdAt).toLocaleDateString('en-IN') }}</p>
            </div>
          </div>
          <p v-if="r.body" class="tw:text-white/65 tw:text-sm tw:leading-relaxed">{{ r.body }}</p>
          <div v-if="r.adminReply" class="tw:mt-3 tw:pl-4 tw:border-l-2 tw:border-gold/30">
            <p class="tw:text-xs tw:text-gold/70 tw:mb-0.5">Reply from Shivragi</p>
            <p class="tw:text-white/60 tw:text-sm">{{ r.adminReply }}</p>
          </div>
        </div>
      </div>

      <AppEmptyState
        v-else
        icon="⭐"
        title="No reviews yet"
        description="Be the first to review this cake!"
      />

      <AppPagination v-if="reviewMeta" :meta="reviewMeta" @change="reviewPage = $event" />
    </div>

    <!-- Review modal -->
    <AppModal :open="showReviewModal" :title="existingReview ? 'Edit Review' : 'Write a Review'" @close="showReviewModal = false">
      <FormsReviewForm
        :cake-id="cake.id"
        :existing-review="existingReview"
        @saved="onReviewSaved"
        @cancel="showReviewModal = false"
      />
    </AppModal>
  </div>
</template>
