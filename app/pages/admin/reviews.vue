<script setup lang="ts">
import type { Review } from '~/types/api'

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin'] })
useHead({ title: 'Reviews – Admin' })

const { showToast } = useAdminToast()
const page = ref(1)
const approvedFilter = ref<'all' | 'pending' | 'approved'>('pending')

const queryParams = computed(() => ({
  page: page.value,
  limit: 20,
  ...(approvedFilter.value === 'pending' ? { approved: 'false' } : approvedFilter.value === 'approved' ? { approved: 'true' } : {}),
}))

const { data: reviewsData, pending, refresh } = useFetch<any>('/api/admin/reviews', {
  query: queryParams,
  credentials: 'include',
  watch: [queryParams],
})

const reviews = computed<Review[]>(() => reviewsData.value?.data ?? [])
const meta = computed(() => reviewsData.value?.meta)

const replyTexts = ref<Record<string, string>>({})
const replyOpen = ref<Record<string, boolean>>({})

async function approveReview(id: string) {
  try {
    await $fetch(`/api/admin/reviews/${id}/approve`, { method: 'PATCH', credentials: 'include' })
    showToast('Review approved.')
    refresh()
  } catch { showToast('Failed to approve.', 'error') }
}

async function submitReply(id: string) {
  try {
    await $fetch(`/api/admin/reviews/${id}/reply`, {
      method: 'PATCH',
      credentials: 'include',
      body: { adminReply: replyTexts.value[id] },
    })
    replyOpen.value[id] = false
    showToast('Reply saved.')
    refresh()
  } catch { showToast('Failed to save reply.', 'error') }
}

async function deleteReview(id: string) {
  if (!confirm('Delete this review?')) return
  try {
    await $fetch(`/api/admin/reviews/${id}`, { method: 'DELETE', credentials: 'include' })
    showToast('Review deleted.')
    refresh()
  } catch { showToast('Failed to delete.', 'error') }
}
</script>

<template>
  <div>
    <div class="tw:flex tw:items-center tw:justify-between tw:mb-6 tw:flex-wrap tw:gap-3">
      <h1 class="tw:font-playfair tw:text-2xl tw:text-gold-light">Reviews</h1>
      <div class="tw:flex tw:gap-2">
        <button
          v-for="f in [{ v: 'pending', l: 'Pending' }, { v: 'approved', l: 'Approved' }, { v: 'all', l: 'All' }]"
          :key="f.v"
          :class="[
            'tw:px-4 tw:py-1.5 tw:rounded-full tw:border tw:text-xs tw:font-medium tw:transition-all',
            approvedFilter === f.v ? 'tw:border-gold tw:bg-gold/15 tw:text-gold' : 'tw:border-gold/20 tw:text-white/50 tw:hover:border-gold/40',
          ]"
          @click="approvedFilter = f.v as any; page = 1"
        >
          {{ f.l }}
        </button>
      </div>
    </div>

    <!-- Skeleton -->
    <div v-if="pending" class="tw:space-y-3">
      <div v-for="i in 5" :key="i" class="tw:h-32 tw:bg-white/4 tw:border tw:border-gold/10 tw:rounded-2xl tw:animate-pulse" />
    </div>

    <AppEmptyState v-else-if="!reviews.length" icon="⭐" title="No reviews" description="Nothing to moderate here." />

    <div v-else class="tw:space-y-4">
      <div
        v-for="r in reviews"
        :key="r.id"
        class="tw:bg-white/4 tw:border tw:border-gold/10 tw:rounded-2xl tw:p-5"
      >
        <div class="tw:flex tw:items-start tw:justify-between tw:gap-4 tw:mb-3">
          <div>
            <div class="tw:flex tw:items-center tw:gap-2 tw:mb-1">
              <AppRatingStars :value="r.rating" size="sm" />
              <span v-if="r.isVerifiedPurchase" class="tw:text-xs tw:text-emerald-400">✓ Verified</span>
              <span v-if="!r.isApproved" class="tw:text-xs tw:bg-amber-500/15 tw:text-amber-400 tw:px-2 tw:rounded-full tw:border tw:border-amber-500/25">Pending</span>
            </div>
            <p v-if="r.title" class="tw:font-semibold tw:text-cream tw:text-sm">{{ r.title }}</p>
            <p v-if="r.body" class="tw:text-white/60 tw:text-sm tw:mt-1">{{ r.body }}</p>
            <p class="tw:text-xs tw:text-white/30 tw:mt-1">{{ new Date(r.createdAt).toLocaleDateString('en-IN') }}</p>
          </div>
          <div class="tw:flex tw:gap-2 tw:shrink-0 tw:flex-wrap tw:justify-end">
            <AppButton v-if="!r.isApproved" variant="outline" size="sm" @click="approveReview(r.id)">Approve</AppButton>
            <AppButton variant="ghost" size="sm" @click="replyOpen[r.id] = !replyOpen[r.id]; replyTexts[r.id] = r.adminReply ?? ''">Reply</AppButton>
            <AppButton variant="danger" size="sm" @click="deleteReview(r.id)">Delete</AppButton>
          </div>
        </div>

        <!-- Existing reply -->
        <div v-if="r.adminReply && !replyOpen[r.id]" class="tw:pl-4 tw:border-l-2 tw:border-gold/30 tw:mt-2">
          <p class="tw:text-xs tw:text-gold/70">Your reply:</p>
          <p class="tw:text-white/60 tw:text-sm">{{ r.adminReply }}</p>
        </div>

        <!-- Reply textarea -->
        <div v-if="replyOpen[r.id]" class="tw:mt-3 tw:space-y-2">
          <textarea
            v-model="replyTexts[r.id]"
            rows="2"
            placeholder="Write a reply..."
            class="tw:w-full tw:bg-white/5 tw:border tw:border-gold/20 tw:rounded-xl tw:px-3 tw:py-2 tw:text-cream tw:text-sm tw:focus:outline-none tw:focus:border-gold/50 tw:resize-none"
          />
          <div class="tw:flex tw:gap-2">
            <AppButton variant="gold" size="sm" @click="submitReply(r.id)">Save Reply</AppButton>
            <AppButton variant="ghost" size="sm" @click="replyOpen[r.id] = false">Cancel</AppButton>
          </div>
        </div>
      </div>

      <AppPagination v-if="meta" :meta="meta" @change="page = $event" />
    </div>
  </div>
</template>
