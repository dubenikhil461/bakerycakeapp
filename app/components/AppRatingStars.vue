<script setup lang="ts">
const props = defineProps<{
  value: number         // 0-5
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
}>()

const emit = defineEmits<{ 'update:value': [v: number] }>()

const hovered = ref(0)

function starFill(index: number): number {
  const active = hovered.value || props.value
  if (index <= active) return 100
  if (index - 1 < active) return Math.round((active - (index - 1)) * 100)
  return 0
}
</script>

<template>
  <div
    :class="[
      'tw:inline-flex tw:items-center tw:gap-0.5',
      interactive ? 'tw:cursor-pointer' : '',
    ]"
    @mouseleave="hovered = 0"
  >
    <span
      v-for="i in 5"
      :key="i"
      :class="[
        'tw:relative tw:inline-block tw:text-white/20',
        size === 'sm' ? 'tw:text-sm' : size === 'lg' ? 'tw:text-2xl' : 'tw:text-base',
      ]"
      @mouseenter="interactive && (hovered = i)"
      @click="interactive && emit('update:value', i)"
    >
      ★
      <span
        class="tw:absolute tw:inset-0 tw:text-gold tw:overflow-hidden"
        :style="{ width: starFill(i) + '%' }"
      >★</span>
    </span>
  </div>
</template>
