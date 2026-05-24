import { defineFormKitConfig } from '@formkit/vue'

/**
 * FormKit global config – matches the app's dark/gold aesthetic.
 *
 * Every input renders:
 *   .formkit-outer  (outermost wrapper – receives data-invalid when errors are shown)
 *     .formkit-label
 *     .formkit-inner
 *       .formkit-input  (actual <input> / <select> / <textarea>)
 *     .formkit-messages
 *       .formkit-message  (one per error – shows a ▲ pointer via CSS)
 */
export default defineFormKitConfig({
  config: {
    classes: {
      outer: 'formkit-outer',
      label: 'formkit-label tw:block tw:text-xs tw:text-white/40 tw:mb-1',
      inner: 'formkit-inner',
      input: [
        'formkit-input',
        'tw:w-full tw:bg-white/5 tw:border tw:border-gold/20',
        'tw:rounded-xl tw:px-3 tw:py-2.5',
        'tw:text-cream tw:text-sm tw:outline-none tw:transition-all',
        'tw:placeholder-white/25',
        'tw:focus:border-gold/50 tw:focus:shadow-[0_0_0_3px_rgba(240,180,41,0.1)]',
      ].join(' '),
      messages: 'formkit-messages tw:mt-1.5 tw:space-y-1',
      message: 'formkit-message tw:text-xs tw:text-red-400 tw:flex tw:items-center tw:gap-1',
      help: 'formkit-help tw:text-xs tw:text-white/30 tw:mt-1',
    },
  },
})
