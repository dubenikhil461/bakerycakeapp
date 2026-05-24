<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth', 'admin'] })
useHead({ title: 'Dashboard – Admin' })

const { data: recentOrdersData, pending } = await useFetch<any>('/api/admin/orders', {
  query: { limit: 10, sort: 'newest' },
  credentials: 'include',
})

const { data: pendingCountData } = await useFetch<any>('/api/admin/orders', {
  query: { status: 'pending', limit: 1 },
  credentials: 'include',
})

const { data: cakesCountData } = await useFetch<any>('/api/admin/cakes', {
  query: { isActive: 'true', limit: 1 },
  credentials: 'include',
})

const recentOrders = computed(() => recentOrdersData.value?.data ?? [])
const totalOrders = computed(() => recentOrdersData.value?.meta?.total ?? 0)
const pendingOrders = computed(() => pendingCountData.value?.meta?.total ?? 0)
const activeCakes = computed(() => cakesCountData.value?.meta?.total ?? 0)

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div>
    <h1 class="tw:font-playfair tw:text-2xl tw:text-gold-light tw:mb-8">Dashboard</h1>

    <!-- Stat cards -->
    <div class="tw:grid tw:grid-cols-1 tw:sm:grid-cols-3 tw:gap-4 tw:mb-10">
      <div class="tw:bg-white/4 tw:border tw:border-gold/15 tw:rounded-2xl tw:p-5">
        <p class="tw:text-xs tw:text-white/40 tw:uppercase tw:tracking-wider tw:mb-2">Total Orders</p>
        <p class="tw:text-3xl tw:font-playfair tw:text-gold">{{ totalOrders }}</p>
      </div>
      <div class="tw:bg-amber-500/8 tw:border tw:border-amber-500/20 tw:rounded-2xl tw:p-5">
        <p class="tw:text-xs tw:text-white/40 tw:uppercase tw:tracking-wider tw:mb-2">Pending Orders</p>
        <p class="tw:text-3xl tw:font-playfair tw:text-amber-400">{{ pendingOrders }}</p>
      </div>
      <div class="tw:bg-emerald-500/8 tw:border tw:border-emerald-500/20 tw:rounded-2xl tw:p-5">
        <p class="tw:text-xs tw:text-white/40 tw:uppercase tw:tracking-wider tw:mb-2">Active Cakes</p>
        <p class="tw:text-3xl tw:font-playfair tw:text-emerald-400">{{ activeCakes }}</p>
      </div>
    </div>

    <!-- Recent orders table -->
    <div class="tw:bg-white/4 tw:border tw:border-gold/15 tw:rounded-2xl tw:p-5">
      <h2 class="tw:font-semibold tw:text-white/80 tw:mb-4">Recent Orders</h2>
      <AdminDataTable
        :columns="[
          { key: 'orderNumber', label: 'Order #' },
          { key: 'status', label: 'Status' },
          { key: 'payment', label: 'Payment' },
          { key: 'total', label: 'Total' },
          { key: 'date', label: 'Date' },
        ]"
        :loading="pending"
      >
        <tr
          v-for="order in recentOrders"
          :key="order.id"
          class="tw:border-b tw:border-white/5 tw:hover:bg-white/3 tw:transition-colors tw:cursor-pointer"
          @click="$router.push(`/admin/orders/${order.orderNumber}`)"
        >
          <td class="tw:py-3 tw:px-4 tw:font-semibold tw:text-cream tw:text-sm">#{{ order.orderNumber }}</td>
          <td class="tw:py-3 tw:px-4"><AppBadge :status="order.status" /></td>
          <td class="tw:py-3 tw:px-4"><AppBadge :status="order.paymentStatus" /></td>
          <td class="tw:py-3 tw:px-4 tw:text-gold tw:font-semibold tw:text-sm">₹{{ parseFloat(order.totalAmount).toFixed(0) }}</td>
          <td class="tw:py-3 tw:px-4 tw:text-white/45 tw:text-sm">{{ formatDate(order.createdAt) }}</td>
        </tr>
      </AdminDataTable>
    </div>
  </div>
</template>
