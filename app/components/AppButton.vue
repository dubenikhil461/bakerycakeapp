<script setup lang="ts">
defineProps<{
  variant?: 'gold' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}>()
</script>

<template>
  <button
    :type="type ?? 'button'"
    :disabled="disabled || loading"
    :class="[
      'tw:inline-flex tw:items-center tw:justify-center tw:gap-2 tw:font-semibold tw:rounded-full tw:transition-all tw:cursor-pointer tw:select-none',
      'tw:disabled:opacity-50 tw:disabled:cursor-not-allowed',
      // size
      size === 'sm' ? 'tw:px-4 tw:py-1.5 tw:text-xs tw:tracking-wider' :
      size === 'lg' ? 'tw:px-8 tw:py-3 tw:text-sm tw:tracking-widest tw:uppercase' :
                     'tw:px-6 tw:py-2.5 tw:text-sm',
      // variant
      variant === 'gold' || !variant
        ? 'tw:bg-linear-to-br tw:from-gold tw:to-[#e0940a] tw:text-deep tw:shadow-[0_4px_16px_rgba(240,180,41,0.30)] tw:hover:shadow-[0_6px_20px_rgba(240,180,41,0.45)] tw:hover:-translate-y-0.5'
        : variant === 'outline'
        ? 'tw:border tw:border-gold/50 tw:text-gold tw:hover:bg-gold/10 tw:hover:border-gold'
        : variant === 'ghost'
        ? 'tw:text-white/60 tw:hover:text-cream tw:hover:bg-white/6'
        : 'tw:bg-red-500/15 tw:border tw:border-red-500/30 tw:text-red-400 tw:hover:bg-red-500/25',
    ]"
  >
    <AppSpinner v-if="loading" size="sm" />
    <slot />
  </button>
</template>
