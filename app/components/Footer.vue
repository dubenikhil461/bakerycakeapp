<template>
  <footer class="tw:relative tw:z-1 tw:bg-deep/95 tw:border-t tw:border-gold/15 tw:px-6 tw:py-10 tw:md:px-12 tw:flex tw:flex-col tw:md:flex-row tw:justify-between tw:items-center tw:gap-4 tw:text-center tw:md:text-left">
    <div class="tw:font-playfair tw:text-2xl tw:text-gold tw:italic">
      Shivragi Cake
    </div>
    <p class="tw:text-sm tw:text-white/40 tw:leading-relaxed">
      <strong class="tw:text-gold-light tw:font-semibold">100% Pure Veg · Fresh Homemade · Hygienically Made</strong><br>
      Delivery charges apply · Prices per Half KG
    </p>
    <div class="tw:flex tw:gap-2 tw:flex-wrap tw:justify-center tw:md:justify-end">
      <span
        v-for="tag in tags"
        :key="tag"
        class="tw:bg-gold/10 tw:border tw:border-gold/20 tw:rounded-full tw:px-3 tw:py-1 tw:text-[0.68rem] tw:tracking-wide tw:uppercase tw:text-gold-light"
      >
        {{ tag }}
      </span>
    </div>
  </footer>
</template>

<script setup lang="ts">
const tags = ['Eggless', 'Homemade', 'Pure Veg', 'Fresh Daily']
</script>
