import type { Cart, CartItem } from '~/types/api'

const FREE_DELIVERY_ABOVE = 500
const DELIVERY_FEE = 50

export function useCart() {
  const cart = useState<Cart | null>('cart', () => null)
  const cartOpen = useState<boolean>('cart-open', () => false)
  const cartLoading = useState<boolean>('cart-loading', () => false)

  const itemCount = computed(() =>
    cart.value?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0,
  )

  const subtotal = computed(() =>
    cart.value?.items?.reduce(
      (sum, i) => sum + parseFloat(i.unitPrice) * i.quantity,
      0,
    ) ?? 0,
  )

  const deliveryFee = computed(() =>
    subtotal.value >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE,
  )

  const total = computed(() => subtotal.value + deliveryFee.value)

  async function fetchCart() {
    try {
      const res = await $fetch<{ success: true; data: Cart }>('/api/cart', {
        credentials: 'include',
      })
      cart.value = res.data
    } catch {
      // Not logged in or no cart yet — leave null
    }
  }

  async function addToCart(input: {
    cakeId: string
    variantId: string | null
    quantity: number
    customMessage?: string
    deliveryDate?: string
  }) {
    cartLoading.value = true
    try {
      const res = await $fetch<{ success: true; data: Cart }>('/api/cart/items', {
        method: 'POST',
        credentials: 'include',
        body: {
          cakeId: input.cakeId,
          variantId: input.variantId ?? null,
          quantity: input.quantity,
          customMessage: input.customMessage ?? null,
          deliveryDate: input.deliveryDate ?? null,
        },
      })
      cart.value = res.data
      cartOpen.value = true
    } finally {
      cartLoading.value = false
    }
  }

  async function updateItem(id: string, patch: { quantity?: number; customMessage?: string }) {
    if (!cart.value) return
    // Optimistic update
    const prev = cart.value.items.map(i => ({ ...i }))
    if (patch.quantity !== undefined) {
      if (patch.quantity <= 0) {
        cart.value.items = cart.value.items.filter(i => i.id !== id)
      } else {
        const item = cart.value.items.find(i => i.id === id)
        if (item) item.quantity = patch.quantity
      }
    }
    try {
      if (patch.quantity !== undefined && patch.quantity <= 0) {
        await $fetch(`/api/cart/items/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        })
      } else {
        const res = await $fetch<{ success: true; data: Cart }>(`/api/cart/items/${id}`, {
          method: 'PATCH',
          credentials: 'include',
          body: patch,
        })
        cart.value = res.data
      }
    } catch {
      // Revert optimistic update on failure
      if (cart.value) cart.value.items = prev
    }
  }

  async function removeItem(id: string) {
    if (!cart.value) return
    const prev = cart.value.items.map(i => ({ ...i }))
    cart.value.items = cart.value.items.filter(i => i.id !== id)
    try {
      await $fetch(`/api/cart/items/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
    } catch {
      if (cart.value) cart.value.items = prev
    }
  }

  async function clearCart() {
    try {
      await $fetch('/api/cart', { method: 'DELETE', credentials: 'include' })
      if (cart.value) cart.value.items = []
    } catch {}
  }

  return {
    cart: readonly(cart),
    cartOpen,
    cartLoading: readonly(cartLoading),
    itemCount,
    subtotal,
    deliveryFee,
    total,
    fetchCart,
    addToCart,
    updateItem,
    removeItem,
    clearCart,
  }
}
