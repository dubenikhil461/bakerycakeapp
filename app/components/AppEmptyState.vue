<script setup lang="ts">
defineProps<{
  icon?: string
  title: string
  description?: string
  actionLabel?: string
  actionTo?: string
}>()
const emit = defineEmits<{ click: [] }>()
</script>

<template>
  <div class="tw:flex tw:flex-col tw:items-center tw:justify-center tw:py-16 tw:text-center">
    <span v-if="icon" class="tw:text-5xl tw:mb-4">{{ icon }}</span>
    <h3 class="tw:font-playfair tw:text-xl tw:text-white/70 tw:mb-2">{{ title }}</h3>
    <p v-if="description" class="tw:text-white/40 tw:text-sm tw:max-w-xs">{{ description }}</p>
    <div v-if="actionLabel" class="tw:mt-6">
      <NuxtLink
        v-if="actionTo"
        :to="actionTo"
        class="tw:inline-flex tw:items-center tw:gap-2 tw:bg-linear-to-br tw:from-gold tw:to-[#e0940a] tw:text-deep tw:px-6 tw:py-2.5 tw:rounded-full tw:font-semibold tw:text-sm tw:no-underline tw:transition-all tw:hover:-translate-y-0.5"
      >
        {{ actionLabel }}
      </NuxtLink>
      <button
        v-else
        class="tw:inline-flex tw:items-center tw:gap-2 tw:bg-linear-to-br tw:from-gold tw:to-[#e0940a] tw:text-deep tw:px-6 tw:py-2.5 tw:rounded-full tw:font-semibold tw:text-sm tw:transition-all tw:hover:-translate-y-0.5"
        @click="emit('click')"
      >
        {{ actionLabel }}
      </button>
    </div>
  </div>
</template>
