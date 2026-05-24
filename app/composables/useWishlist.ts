import type { WishlistItem } from '~/types/api'
import { authClient } from '~/lib/auth'

export function useWishlist() {
  // Store IDs as array (not Set) for SSR serialisation
  const wishlistIds = useState<string[]>('wishlist-ids', () => [])
  const wishlistItems = useState<WishlistItem[]>('wishlist-items', () => [])

  function isWishlisted(cakeId: string) {
    return wishlistIds.value.includes(cakeId)
  }

  async function fetchWishlist() {
    try {
      const res = await $fetch<{ success: true; data: WishlistItem[] }>('/api/wishlist', {
        credentials: 'include',
      })
      wishlistItems.value = res.data
      wishlistIds.value = res.data.map(w => w.cakeId)
    } catch {
      // Not logged in
    }
  }

  async function toggleWishlist(cakeId: string) {
    const { data: session } = await authClient.getSession()
    if (!session) {
      navigateTo(`/auth?redirect=${encodeURIComponent(useRoute().fullPath)}`)
      return
    }

    const alreadyIn = isWishlisted(cakeId)
    // Optimistic
    if (alreadyIn) {
      wishlistIds.value = wishlistIds.value.filter(id => id !== cakeId)
      wishlistItems.value = wishlistItems.value.filter(w => w.cakeId !== cakeId)
    } else {
      wishlistIds.value = [...wishlistIds.value, cakeId]
    }

    try {
      if (alreadyIn) {
        await $fetch(`/api/wishlist/${cakeId}`, { method: 'DELETE', credentials: 'include' })
      } else {
        const res = await $fetch<{ success: true; data: WishlistItem }>('/api/wishlist', {
          method: 'POST',
          credentials: 'include',
          body: { cakeId },
        })
        wishlistItems.value = [...wishlistItems.value, res.data]
      }
    } catch {
      // Revert optimistic update
      if (alreadyIn) {
        wishlistIds.value = [...wishlistIds.value, cakeId]
      } else {
        wishlistIds.value = wishlistIds.value.filter(id => id !== cakeId)
        wishlistItems.value = wishlistItems.value.filter(w => w.cakeId !== cakeId)
      }
    }
  }

  function clearWishlist() {
    wishlistIds.value = []
    wishlistItems.value = []
  }

  return {
    wishlistIds: readonly(wishlistIds),
    wishlistItems: readonly(wishlistItems),
    isWishlisted,
    fetchWishlist,
    toggleWishlist,
    clearWishlist,
  }
}
