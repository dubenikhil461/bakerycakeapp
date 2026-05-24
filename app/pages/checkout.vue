<script setup lang="ts">
import type { Address, PlaceOrderResult } from '~/types/api'

definePageMeta({ ssr: false, middleware: 'auth' })
useHead({ title: 'Checkout – Shivragi' })

const { cart, subtotal, deliveryFee, total, fetchCart } = useCart()
const { showToast } = useHomeToast()
const router = useRouter()

// Redirect if cart is empty
onMounted(async () => {
  if (!cart.value?.items?.length) {
    await fetchCart()
    if (!cart.value?.items?.length) {
      await router.push('/cart')
    }
  }
})

// ─── Step ─────────────────────────────────────────────────────────────────────
const step = ref<1 | 2 | 3>(1)

// ─── Step 1: Addresses ────────────────────────────────────────────────────────
const addresses = ref<Address[]>([])
const selectedAddressId = ref<string>('')
const showAddressModal = ref(false)

async function fetchAddresses() {
  const res = await $fetch<{ success: true; data: Address[] }>('/api/addresses', { credentials: 'include' })
  addresses.value = res.data
  const def = res.data.find(a => a.isDefault) ?? res.data[0]
  if (def && !selectedAddressId.value) selectedAddressId.value = def.id
}
await fetchAddresses()

function onAddressSaved(addr: Address) {
  showAddressModal.value = false
  fetchAddresses()
  selectedAddressId.value = addr.id
}

// ─── Step 2: Delivery ─────────────────────────────────────────────────────────
const timeSlots = ['10:00–12:00', '12:00–14:00', '14:00–16:00', '16:00–18:00', '18:00–20:00']
const deliveryDate = ref('')
const deliveryTimeSlot = ref(timeSlots[0])
const customerNote = ref('')

const minDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
})

// ─── Step 3: Payment ──────────────────────────────────────────────────────────
const paymentMethod = ref<'cod' | 'upi' | 'card' | 'netbanking' | 'wallet'>('cod')
const placing = ref(false)
const placeError = ref('')

async function placeOrder() {
  placing.value = true
  placeError.value = ''
  try {
    const body: Record<string, any> = {
      shippingAddressId: selectedAddressId.value,
      paymentMethod: paymentMethod.value,
    }
    if (deliveryDate.value) body.deliveryDate = deliveryDate.value
    if (deliveryTimeSlot.value) body.deliveryTimeSlot = deliveryTimeSlot.value
    if (customerNote.value) body.customerNote = customerNote.value

    const res = await $fetch<{ success: true; data: PlaceOrderResult }>('/api/orders', {
      method: 'POST',
      credentials: 'include',
      body,
    })
    const { order, razorpay } = res.data

    if (paymentMethod.value === 'cod' || !razorpay) {
      await router.push(`/orders/${order.orderNumber}?success=true`)
      return
    }

    // Razorpay checkout
    const Razorpay = (window as any).Razorpay
    if (!Razorpay) {
      placeError.value = 'Payment SDK not loaded. Please refresh and try again.'
      return
    }
    const rzp = new Razorpay({
      key: razorpay.keyId,
      amount: razorpay.amount,
      currency: razorpay.currency ?? 'INR',
      order_id: razorpay.razorpayOrderId,
      name: 'Shivragi Cake',
      description: `Order ${order.orderNumber}`,
      theme: { color: '#f0b429' },
      handler: async (response: any) => {
        try {
          await $fetch(`/api/orders/${order.orderNumber}/payment/verify`, {
            method: 'POST',
            credentials: 'include',
            body: {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            },
          })
          await router.push(`/orders/${order.orderNumber}?success=true`)
        } catch {
          showToast('Payment verification failed. Contact support.')
        }
      },
      modal: {
        ondismiss: () => {
          showToast('Payment cancelled. Your order is saved — you can pay later from My Orders.')
          router.push(`/orders/${order.orderNumber}`)
        },
      },
    })
    rzp.open()
  } catch (e: any) {
    placeError.value = e?.data?.error ?? 'Failed to place order. Please try again.'
  } finally {
    placing.value = false
  }
}

const selectedAddress = computed(() => addresses.value.find(a => a.id === selectedAddressId.value))

function formatAddress(a: Address) {
  return [a.line1, a.line2, a.city, a.state, a.pincode].filter(Boolean).join(', ')
}
</script>

<template>
  <div class="tw:max-w-5xl tw:mx-auto tw:px-4 tw:md:px-8 tw:py-12">
    <h1 class="tw:font-playfair tw:text-3xl tw:text-gold-light tw:mb-8">Checkout</h1>

    <!-- Step indicator -->
    <div class="tw:flex tw:items-center tw:gap-2 tw:mb-10">
      <div
        v-for="(label, i) in ['Address', 'Delivery', 'Payment']"
        :key="i"
        class="tw:flex tw:items-center tw:gap-2"
      >
        <div :class="[
          'tw:w-7 tw:h-7 tw:rounded-full tw:flex tw:items-center tw:justify-center tw:text-xs tw:font-bold tw:transition-all',
          step > i + 1 ? 'tw:bg-emerald-500 tw:text-white' : step === i + 1 ? 'tw:bg-gold tw:text-deep' : 'tw:bg-white/10 tw:text-white/40',
        ]">
          {{ step > i + 1 ? '✓' : i + 1 }}
        </div>
        <span :class="['tw:text-sm tw:font-medium', step === i + 1 ? 'tw:text-cream' : 'tw:text-white/40']">{{ label }}</span>
        <span v-if="i < 2" class="tw:text-white/20 tw:mx-1">—</span>
      </div>
    </div>

    <div class="tw:grid tw:grid-cols-1 tw:lg:grid-cols-3 tw:gap-8">
      <!-- Main form -->
      <div class="tw:lg:col-span-2">

        <!-- Step 1: Address -->
        <div v-if="step === 1" class="tw:space-y-4">
          <h2 class="tw:font-playfair tw:text-xl tw:text-gold-light tw:mb-4">Shipping Address</h2>

          <div
            v-for="addr in addresses"
            :key="addr.id"
            :class="[
              'tw:p-4 tw:rounded-2xl tw:border tw:cursor-pointer tw:transition-all',
              selectedAddressId === addr.id ? 'tw:border-gold tw:bg-gold/8' : 'tw:border-gold/15 tw:bg-white/4 tw:hover:border-gold/40',
            ]"
            @click="selectedAddressId = addr.id"
          >
            <div class="tw:flex tw:items-start tw:justify-between">
              <div>
                <div class="tw:flex tw:items-center tw:gap-2 tw:mb-1">
                  <span class="tw:font-semibold tw:text-cream">{{ addr.fullName }}</span>
                  <span v-if="addr.isDefault" class="tw:text-xs tw:bg-gold/20 tw:text-gold tw:px-2 tw:rounded-full">Default</span>
                  <span class="tw:text-xs tw:text-white/40 tw:capitalize">{{ addr.addressType }}</span>
                </div>
                <p class="tw:text-sm tw:text-white/60">{{ formatAddress(addr) }}</p>
                <p class="tw:text-sm tw:text-white/50">{{ addr.phone }}</p>
              </div>
              <div :class="['tw:w-5 tw:h-5 tw:rounded-full tw:border-2 tw:transition-all', selectedAddressId === addr.id ? 'tw:border-gold tw:bg-gold' : 'tw:border-white/20']" />
            </div>
          </div>

          <button
            class="tw:flex tw:items-center tw:gap-2 tw:text-gold tw:text-sm tw:hover:text-gold-light tw:transition-colors"
            @click="showAddressModal = true"
          >
            + Add new address
          </button>

          <AppButton
            variant="gold"
            size="md"
            :disabled="!selectedAddressId"
            class="tw:mt-4"
            @click="step = 2"
          >
            Continue →
          </AppButton>
        </div>

        <!-- Step 2: Delivery -->
        <div v-if="step === 2" class="tw:space-y-5">
          <h2 class="tw:font-playfair tw:text-xl tw:text-gold-light tw:mb-4">Delivery Details</h2>

          <div>
            <label class="tw:block tw:text-xs tw:text-white/40 tw:uppercase tw:tracking-wider tw:mb-1.5">Preferred Delivery Date</label>
            <input
              v-model="deliveryDate"
              type="date"
              :min="minDate"
              class="tw:bg-white/5 tw:border tw:border-gold/20 tw:rounded-xl tw:px-4 tw:py-2.5 tw:text-cream tw:focus:outline-none tw:focus:border-gold/50 tw:text-sm"
            />
          </div>

          <div>
            <label class="tw:block tw:text-xs tw:text-white/40 tw:uppercase tw:tracking-wider tw:mb-2">Preferred Time Slot</label>
            <div class="tw:grid tw:grid-cols-2 tw:sm:grid-cols-3 tw:gap-2">
              <button
                v-for="slot in timeSlots"
                :key="slot"
                :class="[
                  'tw:py-2.5 tw:px-3 tw:rounded-xl tw:border tw:text-sm tw:transition-all',
                  deliveryTimeSlot === slot ? 'tw:border-gold tw:bg-gold/15 tw:text-gold' : 'tw:border-gold/20 tw:text-white/60 tw:hover:border-gold/40',
                ]"
                @click="deliveryTimeSlot = slot"
              >
                {{ slot }}
              </button>
            </div>
          </div>

          <div>
            <label class="tw:block tw:text-xs tw:text-white/40 tw:uppercase tw:tracking-wider tw:mb-1.5">Note <span class="tw:normal-case">(optional)</span></label>
            <textarea
              v-model="customerNote"
              rows="3"
              maxlength="1000"
              placeholder="Any special instructions for your order..."
              class="tw:w-full tw:bg-white/5 tw:border tw:border-gold/20 tw:rounded-xl tw:px-4 tw:py-2.5 tw:text-cream tw:placeholder-white/25 tw:focus:outline-none tw:focus:border-gold/50 tw:text-sm tw:resize-none"
            />
          </div>

          <div class="tw:flex tw:gap-3">
            <AppButton variant="ghost" size="md" @click="step = 1">← Back</AppButton>
            <AppButton variant="gold" size="md" @click="step = 3">Continue →</AppButton>
          </div>
        </div>

        <!-- Step 3: Payment -->
        <div v-if="step === 3" class="tw:space-y-5">
          <h2 class="tw:font-playfair tw:text-xl tw:text-gold-light tw:mb-4">Payment Method</h2>

          <div class="tw:space-y-3">
            <button
              v-for="method in [
                { value: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when your cake arrives' },
                { value: 'upi', label: 'UPI / QR Pay', icon: '📱', desc: 'PhonePe, GPay, Paytm & more' },
                { value: 'card', label: 'Credit / Debit Card', icon: '💳', desc: 'Visa, Mastercard, RuPay' },
                { value: 'netbanking', label: 'Net Banking', icon: '🏦', desc: 'All major banks' },
              ]"
              :key="method.value"
              :class="[
                'tw:w-full tw:flex tw:items-center tw:gap-4 tw:p-4 tw:rounded-2xl tw:border tw:text-left tw:transition-all',
                paymentMethod === method.value ? 'tw:border-gold tw:bg-gold/8' : 'tw:border-gold/15 tw:bg-white/4 tw:hover:border-gold/35',
              ]"
              @click="paymentMethod = method.value as any"
            >
              <span class="tw:text-2xl">{{ method.icon }}</span>
              <div class="tw:flex-1">
                <p class="tw:font-semibold tw:text-cream">{{ method.label }}</p>
                <p class="tw:text-xs tw:text-white/45">{{ method.desc }}</p>
              </div>
              <div :class="['tw:w-5 tw:h-5 tw:rounded-full tw:border-2 tw:transition-all', paymentMethod === method.value ? 'tw:border-gold tw:bg-gold' : 'tw:border-white/20']" />
            </button>
          </div>

          <p v-if="placeError" class="tw:text-red-400 tw:text-sm">{{ placeError }}</p>

          <div class="tw:flex tw:gap-3">
            <AppButton variant="ghost" size="md" @click="step = 2">← Back</AppButton>
            <AppButton variant="gold" size="lg" :loading="placing" @click="placeOrder">
              Place Order
            </AppButton>
          </div>
        </div>
      </div>

      <!-- Order summary sidebar -->
      <div class="tw:bg-white/4 tw:border tw:border-gold/15 tw:rounded-2xl tw:p-5 tw:h-fit tw:space-y-4">
        <h3 class="tw:font-playfair tw:text-gold-light">Order Summary</h3>

        <div v-if="selectedAddress && step > 1" class="tw:text-xs tw:text-white/50 tw:bg-white/4 tw:rounded-lg tw:p-3">
          <p class="tw:font-semibold tw:text-white/70 tw:mb-0.5">{{ selectedAddress.fullName }}</p>
          <p>{{ formatAddress(selectedAddress) }}</p>
        </div>

        <div class="tw:space-y-2">
          <div v-for="item in cart?.items" :key="item.id" class="tw:flex tw:justify-between tw:text-xs tw:text-white/60">
            <span class="tw:truncate tw:flex-1 tw:mr-2">{{ item.cake?.name }} × {{ item.quantity }}</span>
            <span class="tw:shrink-0">₹{{ (parseFloat(item.unitPrice) * item.quantity).toFixed(0) }}</span>
          </div>
        </div>

        <div class="tw:border-t tw:border-white/8 tw:pt-3 tw:space-y-2 tw:text-sm">
          <div class="tw:flex tw:justify-between tw:text-white/60">
            <span>Subtotal</span><span>₹{{ subtotal.toFixed(0) }}</span>
          </div>
          <div class="tw:flex tw:justify-between tw:text-white/60">
            <span>Delivery</span>
            <span :class="deliveryFee === 0 ? 'tw:text-emerald-400' : ''">{{ deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}` }}</span>
          </div>
          <div class="tw:flex tw:justify-between tw:font-bold tw:text-cream tw:text-base tw:pt-1 tw:border-t tw:border-white/8">
            <span>Total</span>
            <span class="tw:text-gold">₹{{ total.toFixed(0) }}</span>
          </div>
        </div>
      </div>
    </div>

    <AppModal :open="showAddressModal" title="Add New Address" @close="showAddressModal = false">
      <FormsAddressForm @saved="onAddressSaved" @cancel="showAddressModal = false" />
    </AppModal>
  </div>
</template>
