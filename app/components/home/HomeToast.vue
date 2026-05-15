<template>
  <div
    class="tw:fixed tw:bottom-8 tw:right-8 tw:z-[999] tw:bg-gradient-to-br tw:from-gold tw:to-[#c97c00] tw:text-deep tw:px-6 tw:py-4 tw:rounded-xl tw:font-bold tw:text-sm tw:shadow-[0_8px_24px_rgba(240,180,41,0.4)] tw:transition-all tw:duration-400"
    :class="toastVisible ? 'tw:translate-y-0 tw:opacity-100' : 'tw:translate-y-24 tw:opacity-0'"
  >
    {{ toastMessage }}
  </div>
</template>

<script setup lang="ts">
const { toastMessage, toastVisible } = useHomeToast()
</script>
