<script setup lang="ts">
import type { OrderListItem, PaginatedResponse } from '~/types/api'

definePageMeta({ ssr: false, middleware: 'auth' })
useHead({ title: 'My Orders – Shivragi' })

const page = ref(1)

const { data: ordersData, pending } = useFetch<PaginatedResponse<OrderListItem>>('/api/orders', {
  query: computed(() => ({ page: page.value, limit: 10 })),
  credentials: 'include',
  watch: [page],
})

const orders = computed<OrderListItem[]>(() => (ordersData.value as any)?.data ?? [])
const meta = computed(() => (ordersData.value as any)?.meta)

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="tw:max-w-3xl tw:mx-auto tw:px-4 tw:md:px-8 tw:py-12">
    <h1 class="tw:font-playfair tw:text-3xl tw:text-gold-light tw:mb-8">My Orders</h1>

    <!-- Skeleton -->
    <div v-if="pending" class="tw:space-y-3">
      <div v-for="i in 5" :key="i" class="tw:h-24 tw:bg-white/4 tw:border tw:border-gold/10 tw:rounded-2xl tw:animate-pulse" />
    </div>

    <!-- Empty -->
    <AppEmptyState
      v-else-if="!orders.length"
      icon="📦"
      title="No orders yet"
      description="Place your first order and track it here!"
      action-label="Browse Cakes"
      action-to="/cakes"
    />

    <!-- Order list -->
    <div v-else class="tw:space-y-3">
      <NuxtLink
        v-for="order in orders"
        :key="order.id"
        :to="`/orders/${order.orderNumber}`"
        class="tw:flex tw:items-center tw:justify-between tw:gap-4 tw:p-5 tw:bg-white/4 tw:border tw:border-gold/10 tw:rounded-2xl tw:hover:border-gold/30 tw:transition-all tw:no-underline tw:group"
      >
        <div class="tw:flex-1 tw:min-w-0">
          <div class="tw:flex tw:items-center tw:gap-2 tw:mb-1 tw:flex-wrap">
            <span class="tw:font-semibold tw:text-cream tw:group-hover:text-gold tw:transition-colors">#{{ order.orderNumber }}</span>
            <AppBadge :status="order.status" />
          </div>
          <p class="tw:text-sm tw:text-white/45">{{ formatDate(order.createdAt) }}</p>
          <p class="tw:text-xs tw:text-white/35 tw:mt-0.5">{{ order.itemCount }} {{ order.itemCount === 1 ? 'item' : 'items' }}</p>
        </div>
        <div class="tw:text-right tw:shrink-0">
          <p class="tw:font-bold tw:text-gold tw:text-lg">₹{{ parseFloat(order.totalAmount).toFixed(0) }}</p>
          <p class="tw:text-xs tw:text-white/35 tw:mt-1">View →</p>
        </div>
      </NuxtLink>

      <AppPagination v-if="meta" :meta="meta" @change="page = $event" />
    </div>
  </div>
</template>
