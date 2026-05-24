<script setup lang="ts">
const { toastMessage, toastVisible, toastType } = useAdminToast()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="tw:transition-all tw:duration-300"
      enter-from-class="tw:opacity-0 tw:translate-y-2"
      leave-active-class="tw:transition-all tw:duration-200"
      leave-to-class="tw:opacity-0 tw:translate-y-2"
    >
      <div
        v-if="toastVisible"
        :class="[
          'tw:fixed tw:bottom-6 tw:right-6 tw:z-300 tw:px-5 tw:py-3 tw:rounded-xl tw:shadow-xl tw:text-sm tw:font-medium tw:max-w-sm',
          toastType === 'success'
            ? 'tw:bg-linear-to-r tw:from-gold/90 tw:to-[#e0940a]/90 tw:text-deep'
            : 'tw:bg-red-600/90 tw:text-white',
        ]"
      >
        {{ toastMessage }}
      </div>
    </Transition>
  </Teleport>
</template>
