<script setup lang="ts">
definePageMeta({ ssr: false, middleware: 'auth' })
useHead({ title: 'Your Cart – Shivragi' })

const { cart, itemCount, subtotal, deliveryFee, total, updateItem, removeItem, clearCart } = useCart()
const clearConfirm = ref(false)
</script>

<template>
  <div class="tw:max-w-4xl tw:mx-auto tw:px-4 tw:md:px-8 tw:py-12">
    <h1 class="tw:font-playfair tw:text-3xl tw:text-gold-light tw:mb-8">Your Cart</h1>

    <AppEmptyState
      v-if="!cart?.items?.length"
      icon="🛒"
      title="Your cart is empty"
      description="Browse our handcrafted cakes and add something delicious!"
      action-label="Browse Cakes"
      action-to="/cakes"
    />

    <div v-else class="tw:grid tw:grid-cols-1 tw:lg:grid-cols-3 tw:gap-8">
      <!-- Items list -->
      <div class="tw:lg:col-span-2 tw:space-y-4">
        <div
          v-for="item in cart.items"
          :key="item.id"
          class="tw:flex tw:gap-4 tw:bg-white/4 tw:border tw:border-gold/10 tw:rounded-2xl tw:p-4"
        >
          <div class="tw:w-20 tw:h-20 tw:rounded-xl tw:overflow-hidden tw:bg-navy tw:shrink-0">
            <img
              v-if="item.cake?.primaryImageUrl"
              :src="item.cake.primaryImageUrl"
              :alt="item.cake?.name"
              class="tw:w-full tw:h-full tw:object-cover"
            />
            <div v-else class="tw:w-full tw:h-full tw:flex tw:items-center tw:justify-center tw:text-3xl">🎂</div>
          </div>

          <div class="tw:flex-1 tw:min-w-0">
            <NuxtLink
              :to="`/cakes/${item.cake?.slug}`"
              class="tw:font-semibold tw:text-cream tw:hover:text-gold tw:transition-colors tw:no-underline tw:block tw:truncate"
            >
              {{ item.cake?.name }}
            </NuxtLink>
            <p v-if="item.variant" class="tw:text-white/45 tw:text-xs tw:mt-0.5">{{ item.variant.name }}</p>
            <p v-if="item.customMessage" class="tw:text-white/40 tw:text-xs tw:mt-0.5 tw:italic">"{{ item.customMessage }}"</p>
            <p class="tw:text-gold tw:font-semibold tw:mt-1">₹{{ parseFloat(item.unitPrice).toFixed(0) }}</p>
          </div>

          <div class="tw:flex tw:flex-col tw:items-center tw:gap-2 tw:shrink-0">
            <div class="tw:flex tw:items-center tw:gap-1 tw:bg-white/6 tw:rounded-full tw:px-1 tw:border tw:border-gold/10">
              <button class="tw:w-7 tw:h-7 tw:flex tw:items-center tw:justify-center tw:hover:text-gold tw:transition-colors" @click="updateItem(item.id, { quantity: item.quantity - 1 })">−</button>
              <span class="tw:w-6 tw:text-center tw:text-sm tw:font-semibold">{{ item.quantity }}</span>
              <button class="tw:w-7 tw:h-7 tw:flex tw:items-center tw:justify-center tw:hover:text-gold tw:transition-colors" @click="updateItem(item.id, { quantity: item.quantity + 1 })">+</button>
            </div>
            <p class="tw:text-sm tw:font-semibold tw:text-white/80">
              ₹{{ (parseFloat(item.unitPrice) * item.quantity).toFixed(0) }}
            </p>
            <button
              class="tw:text-xs tw:text-red-400/70 tw:hover:text-red-400 tw:transition-colors"
              @click="removeItem(item.id)"
            >
              Remove
            </button>
          </div>
        </div>

        <!-- Clear cart -->
        <div class="tw:text-right">
          <button
            v-if="!clearConfirm"
            class="tw:text-xs tw:text-white/30 tw:hover:text-white/50 tw:transition-colors"
            @click="clearConfirm = true"
          >
            Clear cart
          </button>
          <div v-else class="tw:flex tw:items-center tw:justify-end tw:gap-3">
            <span class="tw:text-xs tw:text-white/50">Clear all items?</span>
            <button class="tw:text-xs tw:text-red-400 tw:hover:text-red-300" @click="clearCart(); clearConfirm = false">Yes, clear</button>
            <button class="tw:text-xs tw:text-white/40 tw:hover:text-white/60" @click="clearConfirm = false">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Order summary -->
      <div class="tw:bg-white/4 tw:border tw:border-gold/15 tw:rounded-2xl tw:p-6 tw:space-y-4 tw:h-fit">
        <h2 class="tw:font-playfair tw:text-lg tw:text-gold-light">Order Summary</h2>

        <div class="tw:space-y-2 tw:text-sm">
          <div class="tw:flex tw:justify-between tw:text-white/70">
            <span>Subtotal ({{ itemCount }} {{ itemCount === 1 ? 'item' : 'items' }})</span>
            <span>₹{{ subtotal.toFixed(0) }}</span>
          </div>
          <div class="tw:flex tw:justify-between tw:text-white/70">
            <span>Delivery</span>
            <span :class="deliveryFee === 0 ? 'tw:text-emerald-400' : ''">
              {{ deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}` }}
            </span>
          </div>
          <div v-if="deliveryFee > 0" class="tw:text-xs tw:text-white/35">
            Free delivery on orders above ₹500
          </div>
        </div>

        <div class="tw:flex tw:justify-between tw:font-bold tw:text-cream tw:text-lg tw:pt-3 tw:border-t tw:border-white/10">
          <span>Total</span>
          <span class="tw:text-gold">₹{{ total.toFixed(0) }}</span>
        </div>

        <AppButton variant="gold" size="lg" class="tw:w-full" @click="navigateTo('/checkout')">
          Proceed to Checkout →
        </AppButton>

        <NuxtLink
          to="/cakes"
          class="tw:block tw:text-center tw:text-sm tw:text-white/40 tw:hover:text-white/60 tw:transition-colors tw:no-underline"
        >
          ← Continue Shopping
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
