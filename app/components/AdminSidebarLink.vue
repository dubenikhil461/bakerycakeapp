<script setup lang="ts">
const props = defineProps<{
  to: string
  icon: string
  label: string
  exact?: boolean
}>()

const route = useRoute()
const isActive = computed(() =>
  props.exact ? route.path === props.to : route.path.startsWith(props.to),
)
</script>

<template>
  <NuxtLink
    :to="to"
    :class="[
      'tw:flex tw:items-center tw:gap-3 tw:px-4 tw:py-2.5 tw:rounded-xl tw:text-sm tw:font-medium tw:transition-all tw:no-underline',
      isActive
        ? 'tw:bg-gold/15 tw:text-gold tw:border tw:border-gold/25'
        : 'tw:text-white/55 tw:hover:text-cream tw:hover:bg-white/6',
    ]"
  >
    <span class="tw:text-base">{{ icon }}</span>
    <span>{{ label }}</span>
  </NuxtLink>
</template>
