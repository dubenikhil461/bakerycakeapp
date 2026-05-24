<script setup lang="ts">
const props = defineProps<{ status: string }>()

const colorMap: Record<string, string> = {
  pending:          'tw:bg-amber-500/15 tw:text-amber-400 tw:border-amber-500/25',
  confirmed:        'tw:bg-blue-500/15 tw:text-blue-400 tw:border-blue-500/25',
  preparing:        'tw:bg-violet-500/15 tw:text-violet-400 tw:border-violet-500/25',
  ready:            'tw:bg-cyan-500/15 tw:text-cyan-400 tw:border-cyan-500/25',
  out_for_delivery: 'tw:bg-purple-500/15 tw:text-purple-400 tw:border-purple-500/25',
  delivered:        'tw:bg-emerald-500/15 tw:text-emerald-400 tw:border-emerald-500/25',
  cancelled:        'tw:bg-red-500/15 tw:text-red-400 tw:border-red-500/25',
  refunded:         'tw:bg-white/8 tw:text-white/50 tw:border-white/15',
  paid:             'tw:bg-emerald-500/15 tw:text-emerald-400 tw:border-emerald-500/25',
  failed:           'tw:bg-red-500/15 tw:text-red-400 tw:border-red-500/25',
}

const label = computed(() =>
  props.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
)
const cls = computed(() => colorMap[props.status] ?? 'tw:bg-white/8 tw:text-white/50 tw:border-white/15')
</script>

<template>
  <span :class="['tw:inline-flex tw:items-center tw:px-2 tw:py-0.5 tw:rounded-full tw:border tw:text-xs tw:font-medium', cls]">
    {{ label }}
  </span>
</template>
