<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth', 'admin'] })
useHead({ title: 'Orders – Admin' })

const router = useRouter()
const page = ref(1)
const statusFilter = ref('')
const paymentFilter = ref('')

const queryParams = computed(() => ({
  page: page.value,
  limit: 20,
  ...(statusFilter.value ? { status: statusFilter.value } : {}),
  ...(paymentFilter.value ? { paymentStatus: paymentFilter.value } : {}),
}))

const { data: ordersData, pending } = useFetch<any>('/api/admin/orders', {
  query: queryParams,
  credentials: 'include',
  watch: [queryParams],
})

const orders = computed(() => ordersData.value?.data ?? [])
const meta = computed(() => ordersData.value?.meta)

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div>
    <h1 class="tw:font-playfair tw:text-2xl tw:text-gold-light tw:mb-6">Orders</h1>

    <!-- Filters -->
    <div class="tw:flex tw:flex-wrap tw:gap-3 tw:mb-6">
      <select
        v-model="statusFilter"
        class="tw:bg-white/5 tw:border tw:border-gold/20 tw:rounded-xl tw:px-3 tw:py-2 tw:text-cream tw:text-sm tw:focus:outline-none"
        @change="page = 1"
      >
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="preparing">Preparing</option>
        <option value="ready">Ready</option>
        <option value="out_for_delivery">Out for Delivery</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
        <option value="refunded">Refunded</option>
      </select>
      <select
        v-model="paymentFilter"
        class="tw:bg-white/5 tw:border tw:border-gold/20 tw:rounded-xl tw:px-3 tw:py-2 tw:text-cream tw:text-sm tw:focus:outline-none"
        @change="page = 1"
      >
        <option value="">All Payments</option>
        <option value="pending">Pending</option>
        <option value="paid">Paid</option>
        <option value="failed">Failed</option>
        <option value="refunded">Refunded</option>
      </select>
    </div>

    <div class="tw:bg-white/4 tw:border tw:border-gold/15 tw:rounded-2xl tw:p-5">
      <AdminDataTable
        :columns="[
          { key: 'order', label: 'Order #' },
          { key: 'status', label: 'Status' },
          { key: 'payment', label: 'Payment' },
          { key: 'total', label: 'Total' },
          { key: 'date', label: 'Date' },
        ]"
        :loading="pending"
      >
        <tr
          v-for="order in orders"
          :key="order.id"
          class="tw:border-b tw:border-white/5 tw:hover:bg-white/3 tw:cursor-pointer tw:transition-colors"
          @click="router.push(`/admin/orders/${order.orderNumber}`)"
        >
          <td class="tw:py-3 tw:px-4 tw:font-semibold tw:text-cream tw:text-sm">#{{ order.orderNumber }}</td>
          <td class="tw:py-3 tw:px-4"><AppBadge :status="order.status" /></td>
          <td class="tw:py-3 tw:px-4"><AppBadge :status="order.paymentStatus" /></td>
          <td class="tw:py-3 tw:px-4 tw:text-gold tw:font-semibold tw:text-sm">₹{{ parseFloat(order.totalAmount).toFixed(0) }}</td>
          <td class="tw:py-3 tw:px-4 tw:text-white/45 tw:text-sm">{{ formatDate(order.createdAt) }}</td>
        </tr>
      </AdminDataTable>
    </div>

    <AppPagination v-if="meta" :meta="meta" @change="page = $event" />
  </div>
</template>
