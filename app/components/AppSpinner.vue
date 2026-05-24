<script setup lang="ts">
defineProps<{ size?: 'sm' | 'md' | 'lg' }>()
</script>

<template>
  <span
    :class="[
      'tw:inline-block tw:rounded-full tw:border-2 tw:border-current tw:border-t-transparent tw:animate-spin tw:shrink-0',
      size === 'sm' ? 'tw:w-3.5 tw:h-3.5' :
      size === 'lg' ? 'tw:w-7 tw:h-7' :
                     'tw:w-5 tw:h-5',
    ]"
  />
</template>
