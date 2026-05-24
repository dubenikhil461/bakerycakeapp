<script setup lang="ts">
import type { Order } from '~/types/api'

definePageMeta({ ssr: false, middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const { showToast } = useHomeToast()
const orderNumber = route.params.orderNumber as string
const successBanner = ref(route.query.success === 'true')

const { data: orderRes, refresh } = await useFetch<{ success: true; data: Order }>(
  `/api/orders/${orderNumber}`,
  { credentials: 'include' },
)

if (!orderRes.value?.data) {
  throw createError({ statusCode: 404, message: 'Order not found' })
}

const order = computed(() => orderRes.value!.data)

useHead(() => ({ title: `Order #${order.value.orderNumber} – Shivragi` }))

// Cancel order
const cancelling = ref(false)
const showCancelModal = ref(false)

async function cancelOrder() {
  cancelling.value = true
  try {
    await $fetch(`/api/orders/${orderNumber}/cancel`, {
      method: 'POST',
      credentials: 'include',
    })
    showCancelModal.value = false
    showToast('Order cancelled.')
    refresh()
  } catch (e: any) {
    showToast(e?.data?.error ?? 'Could not cancel order.')
  } finally {
    cancelling.value = false
  }
}

const canCancel = computed(() => ['pending', 'confirmed'].includes(order.value.status))

const statusSteps = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
]

const cancelledOrRefunded = computed(() => ['cancelled', 'refunded'].includes(order.value.status))

function stepState(stepKey: string): 'done' | 'active' | 'upcoming' | 'cancelled' {
  if (cancelledOrRefunded.value) return 'cancelled'
  const stepIdx = statusSteps.findIndex(s => s.key === stepKey)
  const curIdx = statusSteps.findIndex(s => s.key === order.value.status)
  if (curIdx === -1) return 'upcoming'
  if (stepIdx < curIdx) return 'done'
  if (stepIdx === curIdx) return 'active'
  return 'upcoming'
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatShort(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
</script>

<template>
  <div class="tw:max-w-3xl tw:mx-auto tw:px-4 tw:md:px-8 tw:py-12">
    <!-- Success banner -->
    <div v-if="successBanner" class="tw:mb-6 tw:bg-emerald-500/15 tw:border tw:border-emerald-500/30 tw:rounded-2xl tw:p-4 tw:flex tw:items-center tw:justify-between tw:gap-4">
      <div class="tw:flex tw:items-center tw:gap-3">
        <span class="tw:text-2xl">🎉</span>
        <div>
          <p class="tw:font-semibold tw:text-emerald-400">Order placed successfully!</p>
          <p class="tw:text-sm tw:text-white/60">We'll keep you updated on your order status.</p>
        </div>
      </div>
      <button class="tw:text-white/30 tw:hover:text-white/60 tw:transition-colors" @click="successBanner = false">✕</button>
    </div>

    <!-- Header -->
    <div class="tw:flex tw:items-start tw:justify-between tw:gap-4 tw:mb-8 tw:flex-wrap">
      <div>
        <button class="tw:text-xs tw:text-white/40 tw:hover:text-white/60 tw:mb-3 tw:transition-colors" @click="router.push('/orders')">← My Orders</button>
        <div class="tw:flex tw:items-center tw:gap-3 tw:flex-wrap">
          <h1 class="tw:font-playfair tw:text-2xl tw:text-gold-light">#{{ order.orderNumber }}</h1>
          <AppBadge :status="order.status" />
          <AppBadge :status="order.paymentStatus" />
        </div>
        <p class="tw:text-sm tw:text-white/40 tw:mt-1">Placed {{ formatDate(order.createdAt) }}</p>
      </div>
      <AppButton v-if="canCancel" variant="danger" size="sm" @click="showCancelModal = true">
        Cancel Order
      </AppButton>
    </div>

    <div class="tw:grid tw:grid-cols-1 tw:md:grid-cols-5 tw:gap-6">
      <!-- Left column -->
      <div class="tw:md:col-span-3 tw:space-y-6">

        <!-- Status timeline -->
        <div class="tw:bg-white/4 tw:border tw:border-gold/10 tw:rounded-2xl tw:p-5">
          <h2 class="tw:font-semibold tw:text-white/80 tw:mb-5 tw:text-sm tw:uppercase tw:tracking-wider">Order Status</h2>

          <!-- Cancelled / Refunded state -->
          <div v-if="cancelledOrRefunded" class="tw:flex tw:items-center tw:gap-3 tw:p-4 tw:bg-red-500/10 tw:border tw:border-red-500/20 tw:rounded-xl">
            <span class="tw:text-2xl">❌</span>
            <div>
              <p class="tw:font-semibold tw:text-red-400 tw:capitalize">{{ order.status }}</p>
              <p v-if="order.adminNote" class="tw:text-sm tw:text-white/50 tw:mt-0.5">{{ order.adminNote }}</p>
            </div>
          </div>

          <!-- Normal timeline -->
          <div v-else class="tw:space-y-0">
            <div
              v-for="(step, i) in statusSteps"
              :key="step.key"
              class="tw:flex tw:gap-3"
            >
              <!-- Connector line + dot -->
              <div class="tw:flex tw:flex-col tw:items-center">
                <div :class="[
                  'tw:w-7 tw:h-7 tw:rounded-full tw:flex tw:items-center tw:justify-center tw:text-xs tw:font-bold tw:shrink-0 tw:transition-all',
                  stepState(step.key) === 'done' ? 'tw:bg-emerald-500 tw:text-white' :
                  stepState(step.key) === 'active' ? 'tw:bg-gold tw:text-deep' :
                  'tw:bg-white/8 tw:text-white/25',
                ]">
                  {{ stepState(step.key) === 'done' ? '✓' : i + 1 }}
                </div>
                <div v-if="i < statusSteps.length - 1" :class="[
                  'tw:w-px tw:flex-1 tw:min-h-6 tw:my-1',
                  stepState(step.key) === 'done' ? 'tw:bg-emerald-500/50' : 'tw:bg-white/10',
                ]" />
              </div>
              <!-- Label -->
              <div class="tw:pb-4 tw:pt-0.5">
                <p :class="[
                  'tw:text-sm tw:font-medium tw:leading-tight',
                  stepState(step.key) === 'active' ? 'tw:text-gold' :
                  stepState(step.key) === 'done' ? 'tw:text-emerald-400' :
                  'tw:text-white/30',
                ]">{{ step.label }}</p>
                <!-- History entry timestamp for this step -->
                <p
                  v-if="order.statusHistory?.find(h => h.status === step.key)"
                  class="tw:text-xs tw:text-white/30 tw:mt-0.5"
                >
                  {{ formatDate(order.statusHistory.find(h => h.status === step.key)!.createdAt) }}
                </p>
                <p
                  v-if="order.statusHistory?.find(h => h.status === step.key)?.note"
                  class="tw:text-xs tw:text-white/45 tw:mt-0.5"
                >
                  {{ order.statusHistory.find(h => h.status === step.key)!.note }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Items -->
        <div class="tw:bg-white/4 tw:border tw:border-gold/10 tw:rounded-2xl tw:p-5">
          <h2 class="tw:font-semibold tw:text-white/80 tw:mb-4 tw:text-sm tw:uppercase tw:tracking-wider">Items</h2>
          <div class="tw:space-y-4">
            <div v-for="item in order.items" :key="item.id" class="tw:flex tw:gap-3">
              <div class="tw:w-14 tw:h-14 tw:rounded-xl tw:overflow-hidden tw:bg-navy tw:shrink-0">
                <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.cakeName" class="tw:w-full tw:h-full tw:object-cover" />
                <div v-else class="tw:w-full tw:h-full tw:flex tw:items-center tw:justify-center tw:text-2xl">🎂</div>
              </div>
              <div class="tw:flex-1 tw:min-w-0">
                <p class="tw:font-semibold tw:text-cream tw:truncate">{{ item.cakeName }}</p>
                <p v-if="item.variantName" class="tw:text-xs tw:text-white/40">{{ item.variantName }}</p>
                <p v-if="item.customMessage" class="tw:text-xs tw:text-white/35 tw:italic">"{{ item.customMessage }}"</p>
              </div>
              <div class="tw:text-right tw:shrink-0">
                <p class="tw:text-sm tw:text-white/60">× {{ item.quantity }}</p>
                <p class="tw:font-semibold tw:text-gold tw:text-sm tw:mt-0.5">₹{{ (parseFloat(item.unitPrice) * item.quantity).toFixed(0) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right column -->
      <div class="tw:md:col-span-2 tw:space-y-4">

        <!-- Price breakdown -->
        <div class="tw:bg-white/4 tw:border tw:border-gold/10 tw:rounded-2xl tw:p-5 tw:space-y-3">
          <h2 class="tw:font-semibold tw:text-white/80 tw:text-sm tw:uppercase tw:tracking-wider">Summary</h2>
          <div class="tw:space-y-2 tw:text-sm">
            <div class="tw:flex tw:justify-between tw:text-white/60">
              <span>Subtotal</span><span>₹{{ parseFloat(order.subtotal).toFixed(0) }}</span>
            </div>
            <div class="tw:flex tw:justify-between tw:text-white/60">
              <span>Delivery</span>
              <span :class="parseFloat(order.deliveryFee) === 0 ? 'tw:text-emerald-400' : ''">
                {{ parseFloat(order.deliveryFee) === 0 ? 'FREE' : `₹${parseFloat(order.deliveryFee).toFixed(0)}` }}
              </span>
            </div>
          </div>
          <div class="tw:border-t tw:border-white/8 tw:pt-3 tw:flex tw:justify-between tw:font-bold tw:text-cream">
            <span>Total</span><span class="tw:text-gold">₹{{ parseFloat(order.totalAmount).toFixed(0) }}</span>
          </div>
          <div class="tw:text-xs tw:text-white/35 tw:pt-1">
            Payment: <span class="tw:capitalize tw:text-white/55">{{ order.paymentMethod.replace(/_/g, ' ') }}</span>
          </div>
        </div>

        <!-- Delivery info -->
        <div v-if="order.deliveryDate || order.deliveryTimeSlot" class="tw:bg-white/4 tw:border tw:border-gold/10 tw:rounded-2xl tw:p-5 tw:space-y-2">
          <h2 class="tw:font-semibold tw:text-white/80 tw:text-sm tw:uppercase tw:tracking-wider tw:mb-2">Delivery</h2>
          <div v-if="order.deliveryDate" class="tw:flex tw:items-center tw:gap-2 tw:text-sm tw:text-white/65">
            <span>📅</span><span>{{ formatShort(order.deliveryDate) }}</span>
          </div>
          <div v-if="order.deliveryTimeSlot" class="tw:flex tw:items-center tw:gap-2 tw:text-sm tw:text-white/65">
            <span>🕐</span><span>{{ order.deliveryTimeSlot }}</span>
          </div>
          <div v-if="order.customerNote" class="tw:text-xs tw:text-white/40 tw:italic tw:pt-1">"{{ order.customerNote }}"</div>
        </div>

        <!-- Shipping address -->
        <div v-if="order.shippingSnapshot" class="tw:bg-white/4 tw:border tw:border-gold/10 tw:rounded-2xl tw:p-5">
          <h2 class="tw:font-semibold tw:text-white/80 tw:text-sm tw:uppercase tw:tracking-wider tw:mb-3">Shipping To</h2>
          <p class="tw:font-semibold tw:text-cream tw:text-sm">{{ order.shippingSnapshot.fullName }}</p>
          <p class="tw:text-xs tw:text-white/50 tw:mt-1 tw:leading-relaxed">
            {{ [order.shippingSnapshot.line1, order.shippingSnapshot.line2, order.shippingSnapshot.city, order.shippingSnapshot.state, order.shippingSnapshot.pincode].filter(Boolean).join(', ') }}
          </p>
          <p class="tw:text-xs tw:text-white/40 tw:mt-1">{{ order.shippingSnapshot.phone }}</p>
        </div>
      </div>
    </div>

    <!-- Cancel confirmation modal -->
    <AppModal :open="showCancelModal" title="Cancel Order" @close="showCancelModal = false">
      <div class="tw:space-y-5">
        <p class="tw:text-white/70 tw:text-sm">Are you sure you want to cancel order <span class="tw:text-cream tw:font-semibold">#{{ order.orderNumber }}</span>? This action cannot be undone.</p>
        <div class="tw:flex tw:gap-3 tw:justify-end">
          <AppButton variant="ghost" size="md" @click="showCancelModal = false">Keep Order</AppButton>
          <AppButton variant="danger" size="md" :loading="cancelling" @click="cancelOrder">Yes, Cancel</AppButton>
        </div>
      </div>
    </AppModal>
  </div>
</template>
