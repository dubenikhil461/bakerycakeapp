<script setup lang="ts">
import type { Order, OrderStatus } from '~/types/api'

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin'] })

const route = useRoute()
const router = useRouter()
const { showToast } = useAdminToast()
const orderNumber = route.params.orderNumber as string

const { data: orderRes, refresh } = await useFetch<{ success: true; data: Order }>(
  `/api/admin/orders/${orderNumber}`,
  { credentials: 'include' },
)

if (!orderRes.value?.data) throw createError({ statusCode: 404 })

const order = computed(() => orderRes.value!.data)
useHead(() => ({ title: `Order #${order.value.orderNumber} – Admin` }))

// Status update
const newStatus = ref<OrderStatus>(order.value.status)
const statusNote = ref('')
const updating = ref(false)

async function updateStatus() {
  updating.value = true
  try {
    await $fetch(`/api/admin/orders/${orderNumber}/status`, {
      method: 'PATCH',
      credentials: 'include',
      body: { status: newStatus.value, note: statusNote.value || undefined },
    })
    statusNote.value = ''
    showToast('Status updated.')
    refresh()
  } catch (e: any) {
    showToast(e?.data?.error ?? 'Failed to update.', 'error')
  } finally {
    updating.value = false
  }
}

// Admin note
const adminNote = ref(order.value.adminNote ?? '')
const savingNote = ref(false)

async function saveNote() {
  savingNote.value = true
  try {
    await $fetch(`/api/admin/orders/${orderNumber}/note`, {
      method: 'PATCH',
      credentials: 'include',
      body: { adminNote: adminNote.value },
    })
    showToast('Note saved.')
    refresh()
  } catch {
    showToast('Failed to save note.', 'error')
  } finally {
    savingNote.value = false
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}

const allStatuses: OrderStatus[] = [
  'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled', 'refunded',
]
</script>

<template>
  <div>
    <button class="tw:text-xs tw:text-white/40 tw:hover:text-white/60 tw:mb-4 tw:transition-colors" @click="router.push('/admin/orders')">← Orders</button>

    <div class="tw:flex tw:items-center tw:gap-3 tw:mb-8 tw:flex-wrap">
      <h1 class="tw:font-playfair tw:text-2xl tw:text-gold-light">#{{ order.orderNumber }}</h1>
      <AppBadge :status="order.status" />
      <AppBadge :status="order.paymentStatus" />
    </div>

    <div class="tw:grid tw:grid-cols-1 tw:lg:grid-cols-3 tw:gap-6">
      <!-- Left -->
      <div class="tw:lg:col-span-2 tw:space-y-5">

        <!-- Update status -->
        <div class="tw:bg-white/4 tw:border tw:border-gold/15 tw:rounded-2xl tw:p-5 tw:space-y-4">
          <h2 class="tw:font-semibold tw:text-white/80">Update Status</h2>
          <div class="tw:flex tw:flex-wrap tw:gap-2">
            <button
              v-for="s in allStatuses"
              :key="s"
              :class="[
                'tw:px-3 tw:py-1.5 tw:rounded-full tw:border tw:text-xs tw:capitalize tw:font-medium tw:transition-all',
                newStatus === s ? 'tw:border-gold tw:bg-gold/15 tw:text-gold' : 'tw:border-white/15 tw:text-white/45 tw:hover:border-gold/40',
              ]"
              @click="newStatus = s"
            >
              {{ s.replace(/_/g, ' ') }}
            </button>
          </div>
          <div>
            <label class="tw:block tw:text-xs tw:text-white/40 tw:mb-1">Note (optional)</label>
            <input v-model="statusNote" class="tw:w-full tw:bg-white/5 tw:border tw:border-gold/20 tw:rounded-xl tw:px-3 tw:py-2.5 tw:text-cream tw:text-sm tw:focus:outline-none tw:focus:border-gold/50" placeholder="e.g. Out for delivery via Swiggy Genie" />
          </div>
          <AppButton variant="gold" size="sm" :loading="updating" @click="updateStatus">Update Status</AppButton>
        </div>

        <!-- Items -->
        <div class="tw:bg-white/4 tw:border tw:border-gold/10 tw:rounded-2xl tw:p-5">
          <h2 class="tw:font-semibold tw:text-white/80 tw:mb-4">Order Items</h2>
          <div class="tw:space-y-3">
            <div v-for="item in order.items" :key="item.id" class="tw:flex tw:gap-3">
              <div class="tw:w-12 tw:h-12 tw:rounded-lg tw:overflow-hidden tw:bg-navy tw:shrink-0">
                <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.cakeName" class="tw:w-full tw:h-full tw:object-cover" />
                <div v-else class="tw:w-full tw:h-full tw:flex tw:items-center tw:justify-center">🎂</div>
              </div>
              <div class="tw:flex-1 tw:min-w-0">
                <p class="tw:font-semibold tw:text-cream tw:text-sm">{{ item.cakeName }}</p>
                <p v-if="item.variantName" class="tw:text-xs tw:text-white/40">{{ item.variantName }}</p>
                <p v-if="item.customMessage" class="tw:text-xs tw:text-white/35 tw:italic">"{{ item.customMessage }}"</p>
              </div>
              <div class="tw:text-right tw:shrink-0">
                <p class="tw:text-sm tw:text-white/55">× {{ item.quantity }}</p>
                <p class="tw:font-semibold tw:text-gold tw:text-sm">₹{{ (parseFloat(item.unitPrice) * item.quantity).toFixed(0) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Status timeline -->
        <div class="tw:bg-white/4 tw:border tw:border-gold/10 tw:rounded-2xl tw:p-5">
          <h2 class="tw:font-semibold tw:text-white/80 tw:mb-4">History</h2>
          <div class="tw:space-y-3">
            <div v-for="h in [...(order.statusHistory ?? [])].reverse()" :key="h.id" class="tw:flex tw:gap-3">
              <div class="tw:w-2 tw:h-2 tw:rounded-full tw:bg-gold tw:mt-1.5 tw:shrink-0" />
              <div>
                <div class="tw:flex tw:items-center tw:gap-2">
                  <AppBadge :status="h.status" />
                  <span class="tw:text-xs tw:text-white/30">{{ formatDate(h.createdAt) }}</span>
                </div>
                <p v-if="h.note" class="tw:text-xs tw:text-white/45 tw:mt-0.5">{{ h.note }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right -->
      <div class="tw:space-y-4">
        <!-- Summary -->
        <div class="tw:bg-white/4 tw:border tw:border-gold/10 tw:rounded-2xl tw:p-5 tw:space-y-3">
          <h2 class="tw:font-semibold tw:text-white/80 tw:text-sm">Summary</h2>
          <div class="tw:space-y-1.5 tw:text-sm">
            <div class="tw:flex tw:justify-between tw:text-white/55"><span>Subtotal</span><span>₹{{ parseFloat(order.subtotal).toFixed(0) }}</span></div>
            <div class="tw:flex tw:justify-between tw:text-white/55"><span>Delivery</span><span>₹{{ parseFloat(order.deliveryFee).toFixed(0) }}</span></div>
          </div>
          <div class="tw:border-t tw:border-white/8 tw:pt-2 tw:flex tw:justify-between tw:font-bold tw:text-cream">
            <span>Total</span><span class="tw:text-gold">₹{{ parseFloat(order.totalAmount).toFixed(0) }}</span>
          </div>
          <p class="tw:text-xs tw:text-white/35">Payment: <span class="tw:capitalize tw:text-white/55">{{ order.paymentMethod }}</span></p>
        </div>

        <!-- Customer address -->
        <div v-if="order.shippingSnapshot" class="tw:bg-white/4 tw:border tw:border-gold/10 tw:rounded-2xl tw:p-5">
          <h2 class="tw:font-semibold tw:text-white/80 tw:text-sm tw:mb-2">Ship To</h2>
          <p class="tw:font-semibold tw:text-cream tw:text-sm">{{ order.shippingSnapshot.fullName }}</p>
          <p class="tw:text-xs tw:text-white/50 tw:mt-0.5 tw:leading-relaxed">
            {{ [order.shippingSnapshot.line1, order.shippingSnapshot.line2, order.shippingSnapshot.city, order.shippingSnapshot.state, order.shippingSnapshot.pincode].filter(Boolean).join(', ') }}
          </p>
          <p class="tw:text-xs tw:text-white/40 tw:mt-0.5">{{ order.shippingSnapshot.phone }}</p>
        </div>

        <!-- Delivery slot -->
        <div v-if="order.deliveryDate || order.deliveryTimeSlot" class="tw:bg-white/4 tw:border tw:border-gold/10 tw:rounded-2xl tw:p-5 tw:space-y-1.5 tw:text-sm">
          <h2 class="tw:font-semibold tw:text-white/80 tw:text-sm tw:mb-2">Delivery Slot</h2>
          <p v-if="order.deliveryDate" class="tw:text-white/60">📅 {{ order.deliveryDate }}</p>
          <p v-if="order.deliveryTimeSlot" class="tw:text-white/60">🕐 {{ order.deliveryTimeSlot }}</p>
          <p v-if="order.customerNote" class="tw:text-xs tw:text-white/40 tw:italic">"{{ order.customerNote }}"</p>
        </div>

        <!-- Admin note -->
        <div class="tw:bg-white/4 tw:border tw:border-gold/10 tw:rounded-2xl tw:p-5 tw:space-y-3">
          <h2 class="tw:font-semibold tw:text-white/80 tw:text-sm">Admin Note</h2>
          <textarea
            v-model="adminNote"
            rows="3"
            placeholder="Internal notes (not shown to customer)..."
            class="tw:w-full tw:bg-white/5 tw:border tw:border-gold/20 tw:rounded-xl tw:px-3 tw:py-2.5 tw:text-cream tw:text-sm tw:focus:outline-none tw:focus:border-gold/50 tw:resize-none"
          />
          <AppButton variant="outline" size="sm" :loading="savingNote" @click="saveNote">Save Note</AppButton>
        </div>
      </div>
    </div>
  </div>
</template>
