<script setup lang="ts">
const props = defineProps<{
  open: boolean
  title?: string
}>()
const emit = defineEmits<{ close: [] }>()

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

watch(() => props.open, (v) => {
  if (v) document.addEventListener('keydown', onKeydown)
  else document.removeEventListener('keydown', onKeydown)
}, { immediate: true })

onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="tw:transition-opacity tw:duration-200"
      enter-from-class="tw:opacity-0"
      leave-active-class="tw:transition-opacity tw:duration-150"
      leave-to-class="tw:opacity-0"
    >
      <div
        v-if="open"
        class="tw:fixed tw:inset-0 tw:z-200 tw:flex tw:items-center tw:justify-center tw:p-4"
      >
        <!-- Backdrop -->
        <div
          class="tw:absolute tw:inset-0 tw:bg-black/60 tw:backdrop-blur-sm"
          @click="emit('close')"
        />

        <!-- Panel -->
        <div class="tw:relative tw:z-10 tw:w-full tw:max-w-lg tw:bg-[#0f1623] tw:border tw:border-gold/20 tw:rounded-2xl tw:shadow-2xl tw:overflow-hidden">
          <!-- Header -->
          <div class="tw:flex tw:items-center tw:justify-between tw:px-6 tw:py-4 tw:border-b tw:border-gold/15">
            <h3 v-if="title" class="tw:font-playfair tw:text-lg tw:text-gold-light">{{ title }}</h3>
            <button
              class="tw:text-white/40 tw:hover:text-white/70 tw:transition-colors tw:ml-auto tw:text-xl tw:leading-none"
              @click="emit('close')"
            >
              ✕
            </button>
          </div>

          <!-- Content -->
          <div class="tw:px-6 tw:py-5 tw:max-h-[80vh] tw:overflow-y-auto">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
