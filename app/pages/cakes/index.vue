<script setup lang="ts">
import type { CakeListItem, Category, PaginatedResponse, ApiResponse } from '~/types/api'

definePageMeta({ ssr: false })
useHead({ title: 'Browse Cakes – Shivragi' })

const route = useRoute()
const router = useRouter()

// ─── Filter state (seeded from URL) ──────────────────────────────────────────
const selectedCategory = ref<string>((route.query.category as string) ?? '')
const minPrice = ref<string>((route.query.minPrice as string) ?? '')
const maxPrice = ref<string>((route.query.maxPrice as string) ?? '')
const sort = ref<string>((route.query.sort as string) ?? 'newest')
const searchQuery = ref<string>((route.query.search as string) ?? '')
const page = ref<number>(Number(route.query.page) || 1)
const searchDebounced = ref(searchQuery.value)

// Debounce search
let searchTimer: ReturnType<typeof setTimeout>
watch(searchQuery, (val) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    searchDebounced.value = val
    page.value = 1
  }, 400)
})

// Reset page on filter changes
watch([selectedCategory, minPrice, maxPrice, sort, searchDebounced], () => {
  page.value = 1
})

// Sync filters to URL
watch([selectedCategory, minPrice, maxPrice, sort, searchDebounced, page], () => {
  const query: Record<string, string> = {}
  if (selectedCategory.value) query.category = selectedCategory.value
  if (minPrice.value) query.minPrice = minPrice.value
  if (maxPrice.value) query.maxPrice = maxPrice.value
  if (sort.value !== 'newest') query.sort = sort.value
  if (searchDebounced.value) query.search = searchDebounced.value
  if (page.value > 1) query.page = String(page.value)
  router.replace({ query })
}, { flush: 'sync' })

// ─── API queries ──────────────────────────────────────────────────────────────
const { data: catData } = await useFetch<ApiResponse<Category[]>>('/api/categories', { credentials: 'include' })
const categories = computed<Category[]>(() => (catData.value as any)?.data ?? [])

const queryParams = computed(() => ({
  page: page.value,
  limit: 12,
  ...(selectedCategory.value ? { category: selectedCategory.value } : {}),
  ...(minPrice.value ? { minPrice: minPrice.value } : {}),
  ...(maxPrice.value ? { maxPrice: maxPrice.value } : {}),
  ...(sort.value !== 'newest' ? { sort: sort.value } : {}),
  ...(searchDebounced.value ? { search: searchDebounced.value } : {}),
}))

const { data: cakesData, pending } = useFetch<PaginatedResponse<CakeListItem>>('/api/cakes', {
  query: queryParams,
  credentials: 'include',
  watch: [queryParams],
})

const cakes = computed<CakeListItem[]>(() => (cakesData.value as any)?.data ?? [])
const meta = computed(() => (cakesData.value as any)?.meta)

function clearFilters() {
  selectedCategory.value = ''
  minPrice.value = ''
  maxPrice.value = ''
  sort.value = 'newest'
  searchQuery.value = ''
  searchDebounced.value = ''
}

const hasActiveFilters = computed(() =>
  selectedCategory.value || minPrice.value || maxPrice.value || sort.value !== 'newest' || searchDebounced.value,
)
</script>

<template>
  <div class="tw:max-w-7xl tw:mx-auto tw:px-4 tw:md:px-8 tw:py-12">
    <!-- Header -->
    <div class="tw:mb-8">
      <h1 class="tw:font-playfair tw:text-4xl tw:text-gold-light tw:mb-1">Our Cakes</h1>
      <p class="tw:text-white/50 tw:text-sm">Handcrafted eggless cakes made fresh daily</p>
    </div>

    <div class="tw:flex tw:gap-8">
      <!-- Filter sidebar -->
      <aside class="tw:hidden tw:lg:block tw:w-56 tw:shrink-0">
        <div class="tw:bg-white/4 tw:border tw:border-gold/15 tw:rounded-2xl tw:p-5 tw:space-y-6 tw:sticky tw:top-28">
          <h3 class="tw:font-semibold tw:text-white/80 tw:text-sm tw:uppercase tw:tracking-wider">Filters</h3>

          <!-- Search -->
          <div>
            <label class="tw:block tw:text-xs tw:text-white/40 tw:mb-1.5">Search</label>
            <input
              v-model="searchQuery"
              placeholder="Cake name..."
              class="tw:w-full tw:bg-white/6 tw:border tw:border-gold/20 tw:rounded-lg tw:px-3 tw:py-2 tw:text-sm tw:text-cream tw:placeholder-white/25 tw:focus:outline-none tw:focus:border-gold/50"
            />
          </div>

          <!-- Category -->
          <div>
            <label class="tw:block tw:text-xs tw:text-white/40 tw:mb-1.5">Category</label>
            <select
              v-model="selectedCategory"
              class="tw:w-full tw:bg-navy tw:border tw:border-gold/20 tw:rounded-lg tw:px-3 tw:py-2 tw:text-sm tw:text-cream tw:focus:outline-none tw:focus:border-gold/50"
            >
              <option value="">All Categories</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.slug">{{ cat.name }}</option>
            </select>
          </div>

          <!-- Price range -->
          <div>
            <label class="tw:block tw:text-xs tw:text-white/40 tw:mb-1.5">Price Range (₹)</label>
            <div class="tw:flex tw:gap-2">
              <input v-model="minPrice" type="number" placeholder="Min" min="0" class="tw:w-full tw:bg-white/6 tw:border tw:border-gold/20 tw:rounded-lg tw:px-2 tw:py-2 tw:text-sm tw:text-cream tw:placeholder-white/25 tw:focus:outline-none" />
              <input v-model="maxPrice" type="number" placeholder="Max" min="0" class="tw:w-full tw:bg-white/6 tw:border tw:border-gold/20 tw:rounded-lg tw:px-2 tw:py-2 tw:text-sm tw:text-cream tw:placeholder-white/25 tw:focus:outline-none" />
            </div>
          </div>

          <!-- Sort -->
          <div>
            <label class="tw:block tw:text-xs tw:text-white/40 tw:mb-1.5">Sort By</label>
            <select
              v-model="sort"
              class="tw:w-full tw:bg-navy tw:border tw:border-gold/20 tw:rounded-lg tw:px-3 tw:py-2 tw:text-sm tw:text-cream tw:focus:outline-none tw:focus:border-gold/50"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          <button
            v-if="hasActiveFilters"
            class="tw:w-full tw:text-xs tw:text-white/40 tw:hover:text-white/70 tw:transition-colors tw:py-1"
            @click="clearFilters"
          >
            Clear all filters
          </button>
        </div>
      </aside>

      <!-- Main content -->
      <div class="tw:flex-1 tw:min-w-0">
        <!-- Active filter chips -->
        <div v-if="hasActiveFilters" class="tw:flex tw:flex-wrap tw:gap-2 tw:mb-6">
          <span v-if="selectedCategory" class="tw:flex tw:items-center tw:gap-1 tw:bg-gold/15 tw:text-gold tw:border tw:border-gold/30 tw:rounded-full tw:px-3 tw:py-1 tw:text-xs">
            {{ selectedCategory }}
            <button @click="selectedCategory = ''">×</button>
          </span>
          <span v-if="minPrice || maxPrice" class="tw:flex tw:items-center tw:gap-1 tw:bg-gold/15 tw:text-gold tw:border tw:border-gold/30 tw:rounded-full tw:px-3 tw:py-1 tw:text-xs">
            ₹{{ minPrice || '0' }} – ₹{{ maxPrice || '∞' }}
            <button @click="minPrice = ''; maxPrice = ''">×</button>
          </span>
          <span v-if="searchDebounced" class="tw:flex tw:items-center tw:gap-1 tw:bg-gold/15 tw:text-gold tw:border tw:border-gold/30 tw:rounded-full tw:px-3 tw:py-1 tw:text-xs">
            "{{ searchDebounced }}"
            <button @click="searchQuery = ''; searchDebounced = ''">×</button>
          </span>
        </div>

        <!-- Results count -->
        <div v-if="!pending && meta" class="tw:text-white/40 tw:text-sm tw:mb-4">
          {{ meta.total }} {{ meta.total === 1 ? 'cake' : 'cakes' }} found
        </div>

        <!-- Skeleton grid -->
        <div v-if="pending" class="tw:grid tw:grid-cols-1 tw:sm:grid-cols-2 tw:xl:grid-cols-3 tw:gap-5">
          <div v-for="i in 12" :key="i" class="tw:bg-white/4 tw:border tw:border-gold/10 tw:rounded-2xl tw:overflow-hidden tw:animate-pulse">
            <div class="tw:aspect-square tw:bg-white/6" />
            <div class="tw:p-4 tw:space-y-2">
              <div class="tw:h-4 tw:bg-white/8 tw:rounded tw:w-3/4" />
              <div class="tw:h-3 tw:bg-white/6 tw:rounded tw:w-1/2" />
            </div>
          </div>
        </div>

        <!-- Cake grid -->
        <div v-else-if="cakes.length" class="tw:grid tw:grid-cols-1 tw:sm:grid-cols-2 tw:xl:grid-cols-3 tw:gap-5">
          <AppCakeCard v-for="cake in cakes" :key="cake.id" :cake="cake" />
        </div>

        <!-- Empty -->
        <AppEmptyState
          v-else
          icon="🔍"
          title="No cakes found"
          description="Try adjusting your filters"
          action-label="Clear Filters"
          @click="clearFilters"
        />

        <AppPagination v-if="meta" :meta="meta" @change="page = $event" />
      </div>
    </div>
  </div>
</template>
