<template>
  <section
    id="auth"
    class="tw:relative tw:z-1 tw:px-5 tw:py-20 tw:md:py-28 tw:flex tw:justify-center"
  >
    <div class="tw:bg-navy/85 tw:border tw:border-gold/25 tw:rounded-3xl tw:backdrop-blur-xl tw:w-full tw:max-w-md tw:overflow-hidden tw:shadow-[0_30px_80px_rgba(0,0,0,0.5),0_0_0_1px_rgba(240,180,41,0.1)]">
      <div class="tw:flex tw:border-b tw:border-gold/15">
        <button
          type="button"
          class="tw:flex-1 tw:py-5 tw:text-center tw:text-xs tw:tracking-widest tw:uppercase tw:font-bold tw:cursor-pointer tw:transition-all tw:border-0"
          :class="activeTab === 'login'
            ? 'tw:text-gold tw:bg-gold/7 tw:border-b-2 tw:border-gold tw:-mb-px'
            : 'tw:text-white/40 tw:bg-transparent'"
          @click="activeTab = 'login'"
        >
          Sign In
        </button>
        <button
          type="button"
          class="tw:flex-1 tw:py-5 tw:text-center tw:text-xs tw:tracking-widest tw:uppercase tw:font-bold tw:cursor-pointer tw:transition-all tw:border-0"
          :class="activeTab === 'signup'
            ? 'tw:text-gold tw:bg-gold/7 tw:border-b-2 tw:border-gold tw:-mb-px'
            : 'tw:text-white/40 tw:bg-transparent'"
          @click="activeTab = 'signup'"
        >
          Sign Up
        </button>
      </div>
      <div class="tw:p-10">
        <ClientOnly>
          <HomeLoginForm
            v-if="activeTab === 'login'"
            @switch-tab="activeTab = $event"
          />
          <HomeSignupForm
            v-else
            @switch-tab="activeTab = $event"
          />
          <template #fallback>
            <div class="tw:text-center tw:py-8 tw:text-white/40 tw:text-sm">
              Loading…
            </div>
          </template>
        </ClientOnly>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type AuthTab = 'login' | 'signup'

const activeTab = ref<AuthTab>('login')
</script>
