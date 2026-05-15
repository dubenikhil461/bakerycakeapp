import type { Ref } from 'vue'

export function useScrollReveal(
  elements: Ref<HTMLElement | null>[],
  options?: { threshold?: number; staggerMs?: number },
) {
  const threshold = options?.threshold ?? 0.1
  const staggerMs = options?.staggerMs ?? 150

  let observer: IntersectionObserver | undefined

  onMounted(() => {
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
      { threshold },
    )

    elements.forEach((elementRef, index) => {
      const el = elementRef.value
      if (!el) {
        return
      }

      el.style.opacity = '0'
      el.style.transform = 'translateY(30px)'
      el.style.transition = `opacity 0.6s ease ${index * staggerMs}ms, transform 0.6s ease ${index * staggerMs}ms`
      observer?.observe(el)
    })
  })

  onUnmounted(() => {
    observer?.disconnect()
  })
}
