<template>
  <section
    id="auth"
    class="tw:relative tw:z-1 tw:px-5 tw:py-20 tw:md:py-28 tw:flex tw:justify-center"
  >
    <div class="tw:bg-navy/85 tw:border tw:border-gold/25 tw:rounded-3xl tw:backdrop-blur-xl tw:w-full tw:max-w-md tw:overflow-hidden tw:shadow-[0_30px_80px_rgba(0,0,0,0.5),0_0_0_1px_rgba(240,180,41,0.1)]">
      <div class="tw:p-10">
        <ClientOnly>
          <FormsLoginForm />
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
