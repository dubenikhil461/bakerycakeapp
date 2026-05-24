<script setup lang="ts">
const { cart, cartOpen, itemCount, subtotal, deliveryFee, total, updateItem, removeItem } = useCart()
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition
      enter-active-class="tw:transition-opacity tw:duration-200"
      enter-from-class="tw:opacity-0"
      leave-active-class="tw:transition-opacity tw:duration-150"
      leave-to-class="tw:opacity-0"
    >
      <div
        v-if="cartOpen"
        class="tw:fixed tw:inset-0 tw:z-140 tw:bg-black/50 tw:backdrop-blur-sm"
        @click="cartOpen = false"
      />
    </Transition>

    <!-- Drawer -->
    <Transition
      enter-active-class="tw:transition-transform tw:duration-300 tw:ease-out"
      enter-from-class="tw:translate-x-full"
      leave-active-class="tw:transition-transform tw:duration-200 tw:ease-in"
      leave-to-class="tw:translate-x-full"
    >
      <div
        v-if="cartOpen"
        class="tw:fixed tw:top-0 tw:right-0 tw:bottom-0 tw:z-150 tw:w-full tw:max-w-sm tw:bg-[#0c1220] tw:border-l tw:border-gold/15 tw:flex tw:flex-col tw:shadow-2xl"
      >
        <!-- Header -->
        <div class="tw:flex tw:items-center tw:justify-between tw:px-5 tw:py-4 tw:border-b tw:border-gold/15">
          <div class="tw:flex tw:items-center tw:gap-2">
            <span class="tw:font-playfair tw:text-lg tw:text-gold-light">Cart</span>
            <span v-if="itemCount" class="tw:w-5 tw:h-5 tw:rounded-full tw:bg-gold tw:text-deep tw:text-xs tw:font-bold tw:flex tw:items-center tw:justify-center">{{ itemCount }}</span>
          </div>
          <button
            class="tw:text-white/40 tw:hover:text-white/70 tw:transition-colors tw:text-xl"
            @click="cartOpen = false"
          >
            ✕
          </button>
        </div>

        <!-- Items -->
        <div class="tw:flex-1 tw:overflow-y-auto tw:p-4 tw:space-y-3">
          <div v-if="!cart?.items?.length" class="tw:flex tw:flex-col tw:items-center tw:justify-center tw:h-full tw:text-center tw:py-12">
            <span class="tw:text-5xl tw:mb-4">🛒</span>
            <p class="tw:text-white/50">Your cart is empty</p>
            <NuxtLink
              to="/cakes"
              class="tw:text-gold tw:text-sm tw:mt-3 tw:hover:underline"
              @click="cartOpen = false"
            >Browse Cakes →</NuxtLink>
          </div>

          <div
            v-for="item in cart?.items"
            :key="item.id"
            class="tw:flex tw:gap-3 tw:bg-white/4 tw:rounded-xl tw:p-3"
          >
            <div class="tw:w-12 tw:h-12 tw:rounded-lg tw:overflow-hidden tw:bg-navy tw:shrink-0">
              <img
                v-if="item.cake?.primaryImageUrl"
                :src="item.cake.primaryImageUrl"
                :alt="item.cake?.name"
                class="tw:w-full tw:h-full tw:object-cover"
              />
              <div v-else class="tw:w-full tw:h-full tw:flex tw:items-center tw:justify-center">🎂</div>
            </div>
            <div class="tw:flex-1 tw:min-w-0">
              <p class="tw:text-sm tw:font-semibold tw:text-cream tw:truncate">{{ item.cake?.name }}</p>
              <p v-if="item.variant" class="tw:text-xs tw:text-white/40">{{ item.variant.name }}</p>
              <p class="tw:text-xs tw:text-gold tw:font-semibold tw:mt-0.5">₹{{ (parseFloat(item.unitPrice) * item.quantity).toFixed(0) }}</p>
            </div>
            <div class="tw:flex tw:flex-col tw:items-center tw:gap-1 tw:shrink-0">
              <div class="tw:flex tw:items-center tw:gap-0.5 tw:bg-white/6 tw:rounded-full tw:border tw:border-gold/10">
                <button class="tw:w-6 tw:h-6 tw:flex tw:items-center tw:justify-center tw:text-sm tw:hover:text-gold tw:transition-colors" @click="updateItem(item.id, { quantity: item.quantity - 1 })">−</button>
                <span class="tw:w-4 tw:text-center tw:text-xs tw:font-semibold">{{ item.quantity }}</span>
                <button class="tw:w-6 tw:h-6 tw:flex tw:items-center tw:justify-center tw:text-sm tw:hover:text-gold tw:transition-colors" @click="updateItem(item.id, { quantity: item.quantity + 1 })">+</button>
              </div>
              <button
                class="tw:text-xs tw:text-red-400/60 tw:hover:text-red-400 tw:transition-colors"
                @click="removeItem(item.id)"
              >✕</button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="cart?.items?.length" class="tw:border-t tw:border-gold/15 tw:p-5 tw:space-y-4">
          <div class="tw:space-y-1.5 tw:text-sm">
            <div class="tw:flex tw:justify-between tw:text-white/55">
              <span>Subtotal</span><span>₹{{ subtotal.toFixed(0) }}</span>
            </div>
            <div class="tw:flex tw:justify-between tw:text-white/55">
              <span>Delivery</span>
              <span :class="deliveryFee === 0 ? 'tw:text-emerald-400' : ''">
                {{ deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}` }}
              </span>
            </div>
            <div v-if="deliveryFee > 0" class="tw:text-xs tw:text-white/30">Free delivery over ₹500</div>
            <div class="tw:flex tw:justify-between tw:font-bold tw:text-cream tw:pt-1 tw:border-t tw:border-white/8">
              <span>Total</span><span class="tw:text-gold">₹{{ total.toFixed(0) }}</span>
            </div>
          </div>
          <NuxtLink
            to="/checkout"
            class="tw:block tw:w-full tw:text-center tw:bg-linear-to-br tw:from-gold tw:to-[#e0940a] tw:text-deep tw:font-bold tw:text-sm tw:py-3 tw:rounded-full tw:no-underline tw:tracking-wider tw:transition-all tw:hover:-translate-y-0.5 tw:shadow-[0_4px_16px_rgba(240,180,41,0.30)]"
            @click="cartOpen = false"
          >
            Checkout →
          </NuxtLink>
          <NuxtLink
            to="/cart"
            class="tw:block tw:text-center tw:text-sm tw:text-white/40 tw:hover:text-white/60 tw:transition-colors tw:no-underline"
            @click="cartOpen = false"
          >
            View Cart
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
