<script setup lang="ts">
import type { PaginationMeta } from '~/types/api'

const props = defineProps<{ meta: PaginationMeta }>()
const emit = defineEmits<{ change: [page: number] }>()

const pages = computed(() => {
  const { page, totalPages } = props.meta
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
  const result: (number | '…')[] = []
  result.push(1)
  if (page > 3) result.push('…')
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
    result.push(i)
  }
  if (page < totalPages - 2) result.push('…')
  result.push(totalPages)
  return result
})
</script>

<template>
  <div v-if="meta.totalPages > 1" class="tw:flex tw:items-center tw:justify-center tw:gap-1.5 tw:mt-8">
    <button
      :disabled="meta.page <= 1"
      class="tw:w-8 tw:h-8 tw:rounded-lg tw:text-sm tw:text-white/50 tw:hover:text-cream tw:hover:bg-white/8 tw:transition-all tw:disabled:opacity-30 tw:disabled:cursor-not-allowed"
      @click="emit('change', meta.page - 1)"
    >
      ‹
    </button>

    <template v-for="p in pages" :key="String(p)">
      <span v-if="p === '…'" class="tw:text-white/30 tw:text-sm tw:px-1">…</span>
      <button
        v-else
        :class="[
          'tw:w-8 tw:h-8 tw:rounded-lg tw:text-sm tw:transition-all',
          p === meta.page
            ? 'tw:bg-gold tw:text-deep tw:font-semibold'
            : 'tw:text-white/50 tw:hover:text-cream tw:hover:bg-white/8',
        ]"
        @click="emit('change', p as number)"
      >
        {{ p }}
      </button>
    </template>

    <button
      :disabled="meta.page >= meta.totalPages"
      class="tw:w-8 tw:h-8 tw:rounded-lg tw:text-sm tw:text-white/50 tw:hover:text-cream tw:hover:bg-white/8 tw:transition-all tw:disabled:opacity-30 tw:disabled:cursor-not-allowed"
      @click="emit('change', meta.page + 1)"
    >
      ›
    </button>
  </div>
</template>
