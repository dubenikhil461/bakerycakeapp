<template>
  <section
    id="catalog"
    class="tw:relative tw:z-[1] tw:px-5 tw:py-16 tw:md:px-8 tw:pb-24 tw:max-w-6xl tw:mx-auto"
  >
    <div class="tw:text-center tw:mb-14">
      <p class="tw:text-xs tw:tracking-[0.2em] tw:uppercase tw:text-gold tw:font-bold tw:mb-3 tw:flex tw:items-center tw:justify-center tw:gap-2.5">
        <span>✦</span> Our Catalog <span>✦</span>
      </p>
      <h2 class="tw:font-playfair tw:text-[clamp(2rem,4vw,3rem)] tw:text-white tw:leading-tight">
        Flavours Made with <em class="tw:italic tw:text-gold">Pure Love</em>
      </h2>
    </div>

    <div
      ref="gridRef"
      class="tw:grid tw:grid-cols-1 tw:md:grid-cols-2 tw:xl:grid-cols-3 tw:gap-8"
    >
      <article
        v-for="category in catalogCategories"
        :key="category.id"
        class="catalog-card tw:bg-white/4 tw:border tw:border-gold/18 tw:rounded-2xl tw:overflow-hidden tw:backdrop-blur-sm tw:transition-all tw:duration-300 tw:hover:-translate-y-1.5 tw:hover:shadow-[0_20px_50px_rgba(240,180,41,0.15)] tw:hover:border-gold/45"
      >
        <header class="tw:px-7 tw:pt-6 tw:pb-5 tw:border-b tw:border-gold/12 tw:flex tw:items-center tw:gap-3">
          <span class="tw:text-3xl">{{ category.icon }}</span>
          <div>
            <h3 class="tw:font-playfair tw:text-xl tw:text-gold">
              {{ category.title }}
            </h3>
            <p class="tw:text-xs tw:tracking-widest tw:uppercase tw:text-white/40 tw:mt-0.5">
              {{ category.subtitle }}
            </p>
          </div>
        </header>
        <ul class="tw:px-7 tw:py-5 tw:pb-6">
          <li
            v-for="item in category.items"
            :key="item.name"
            class="tw:flex tw:justify-between tw:items-center tw:py-2.5 tw:border-b tw:border-white/5 last:tw:border-b-0 tw:rounded-md tw:px-1.5 tw:transition-colors tw:hover:bg-gold/6"
          >
            <span class="tw:text-sm tw:text-white/85 tw:font-medium">{{ item.name }}</span>
            <span class="tw:font-cormorant tw:text-lg tw:text-gold-light tw:font-semibold tw:whitespace-nowrap">
              ₹{{ item.price }}
              <span class="tw:text-xs tw:text-white/35 tw:ml-0.5 tw:font-raleway tw:font-normal">/half kg</span>
            </span>
          </li>
        </ul>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { catalogCategories } from '~/data/catalog'

const gridRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | undefined

onMounted(() => {
  if (!gridRef.value) {
    return
  }

  const cards = Array.from(
    gridRef.value.querySelectorAll<HTMLElement>('.catalog-card'),
  )

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue
        }

        const el = entry.target as HTMLElement
        el.style.opacity = '1'
        el.style.transform = 'translateY(0)'
        observer?.unobserve(el)
      }
    },
    { threshold: 0.1 },
  )

  cards.forEach((el, index) => {
    el.style.opacity = '0'
    el.style.transform = 'translateY(30px)'
    el.style.transition = `opacity 0.6s ease ${index * 150}ms, transform 0.6s ease ${index * 150}ms`
    observer?.observe(el)
  })
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>
