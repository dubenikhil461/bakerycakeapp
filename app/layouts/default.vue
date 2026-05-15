<template>
  <div class="tw:relative tw:font-raleway tw:bg-deep tw:text-cream tw:min-h-screen tw:overflow-x-hidden">
    <HomeStarBackground />
    <HomeNav />
    <main class="tw:relative tw:z-[1] tw:pt-20">
      <slot />
    </main>
    <HomeFooter />
    <HomeToast />
  </div>
</template>
