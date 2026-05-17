<template>
  <div>
    <!-- Hero -->
    <section class="tw:relative tw:z-[1] tw:min-h-[calc(100vh-5rem)] tw:flex tw:flex-col tw:items-center tw:justify-center tw:text-center tw:px-5 tw:pb-16 tw:md:px-8 tw:overflow-hidden">
      <div
        class="tw:pointer-events-none tw:absolute tw:inset-0"
        aria-hidden="true"
      >
        <div
          class="tw:absolute tw:inset-0 tw:bg-[radial-gradient(ellipse_at_center_top,rgba(240,180,41,0.12)_0%,transparent_60%),radial-gradient(ellipse_at_center_bottom,rgba(255,157,181,0.08)_0%,transparent_60%)]"
        />
      </div>

      <span
        v-for="(cake, i) in floatingCakes"
        :key="i"
        class="tw:absolute tw:pointer-events-none tw:opacity-15 tw:animate-float-around"
        :class="cake.position"
        :style="{ animationDelay: cake.delay, fontSize: cake.size }"
      >{{ cake.emoji }}</span>

      <span class="tw:relative tw:inline-flex tw:items-center tw:gap-2 tw:bg-gold/12 tw:border tw:border-gold/35 tw:rounded-full tw:px-5 tw:py-2 tw:text-xs tw:tracking-widest tw:uppercase tw:text-gold-light tw:mb-7 tw:animate-fade-down">
        <span class="tw:text-gold">✦</span>
        100% Pure Veg · Eggless · Homemade
      </span>

      <h1 class="tw:relative tw:font-playfair tw:text-[clamp(3.5rem,9vw,7rem)] tw:font-bold tw:leading-none tw:text-white tw:animate-fade-down tw:[animation-delay:0.1s]">
        Every Slice<br>
        Tells a <em class="tw:italic tw:bg-gradient-to-br tw:from-gold tw:via-gold-light tw:to-gold tw:bg-clip-text tw:text-transparent">Sweet Story</em>
      </h1>

      <p class="tw:relative tw:font-cormorant tw:text-xl tw:md:text-2xl tw:text-white/65 tw:mt-5 tw:mb-10 tw:tracking-wide tw:animate-fade-down tw:[animation-delay:0.2s]">
        Handcrafted with love. Fresh. Eggless. Unforgettable.
      </p>

      <div class="tw:relative tw:flex tw:gap-5 tw:flex-wrap tw:justify-center tw:animate-fade-down tw:[animation-delay:0.3s]">
        <NuxtLink to="/#catalog"
          class="tw:inline-flex tw:bg-gradient-to-br tw:from-gold tw:to-[#c97c00] tw:text-deep tw:px-10 tw:py-3.5 tw:rounded-full tw:font-bold tw:text-sm tw:tracking-widest tw:uppercase tw:no-underline tw:transition-all tw:hover:-translate-y-1 tw:shadow-[0_6px_24px_rgba(240,180,41,0.4)] tw:hover:shadow-[0_12px_32px_rgba(240,180,41,0.55)]"
        >
          Explore Catalog 
          <!-- todo nav to dashboard -->
        </NuxtLink>
      </div>

      <div class="tw:absolute tw:bottom-10 tw:left-1/2 tw:flex tw:flex-col tw:items-center tw:gap-1.5 tw:text-white/30 tw:text-xs tw:tracking-widest tw:uppercase tw:animate-bounce-scroll">
        scroll
        <span class="tw:w-px tw:h-10 tw:bg-gradient-to-b tw:from-gold/60 tw:to-transparent" />
      </div>
    </section>

    <!-- Divider -->
    <div class="tw:relative tw:z-1 tw:flex tw:items-center tw:justify-center tw:gap-5 tw:px-8 tw:py-8">
      <span class="tw:flex-1 tw:h-px tw:bg-gradient-to-r tw:from-transparent tw:via-gold/40 tw:to-transparent" />
      <span class="tw:text-gold tw:text-xl">✦</span>
      <span class="tw:flex-1 tw:h-px tw:bg-gradient-to-r tw:from-transparent tw:via-gold/40 tw:to-transparent" />
    </div>

    <!-- Trust badges -->
    <div class="tw:relative tw:z-1 tw:flex tw:justify-center tw:gap-8 tw:md:gap-12 tw:flex-wrap tw:px-5 tw:pb-12">
      <div
        v-for="(badge, i) in trustBadges"
        :key="badge.label"
        class="tw:flex tw:flex-col tw:items-center tw:gap-2 tw:opacity-0 tw:animate-fade-up"
        :style="{ animationDelay: `${0.1 + i * 0.1}s` }"
      >
        <div class="tw:w-16 tw:h-16 tw:rounded-full tw:bg-gold/10 tw:border tw:border-gold/30 tw:flex tw:items-center tw:justify-center tw:text-3xl tw:transition-transform tw:group-hover:scale-110">
          {{ badge.icon }}
        </div>
        <span class="tw:text-xs tw:tracking-widest tw:uppercase tw:text-gold-light tw:font-semibold tw:text-center">{{ badge.label }}</span>
      </div>
    </div>

    <HomeCatalog />
  </div>
</template>

<script setup lang="ts">
const floatingCakes = [
  { emoji: '🎂', position: 'tw:top-[15%] tw:left-[8%]', delay: '0s', size: '3rem' },
  { emoji: '🍰', position: 'tw:top-[25%] tw:right-[10%]', delay: '2s', size: '5rem' },
  { emoji: '🧁', position: 'tw:bottom-[20%] tw:left-[15%]', delay: '4s', size: '2.5rem' },
  { emoji: '🍓', position: 'tw:bottom-[30%] tw:right-[8%]', delay: '1s', size: '3.5rem' },
]

const trustBadges = [
  { icon: '🥚', label: '100% Eggless' },
  { icon: '🌿', label: 'Pure Veg' },
  { icon: '🏠', label: 'Homemade Fresh' },
  { icon: '✨', label: 'Hygienically Made' },
]
</script>
