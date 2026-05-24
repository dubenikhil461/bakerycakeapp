import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  css: ['~/assets/css/tailwind.css'],

  vite: {
    plugins: [
      tailwindcss(),
    ],
    server: {
      watch: {
        ignored: ['**/node_modules/**', '**/.git/**'],
      },
    },
  },

  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      /** Hono API origin (Better Auth at /api/auth/*) */
      apiBase: 'http://localhost:7021',
    },
  },

  app: {
    head: {
      title: 'Shivragi Cake – Homemade Fresh Eggless Cakes',
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:wght@300;400;600&family=Raleway:wght@300;400;600;700&display=swap',
        },
      ],
      script: [
        { src: 'https://checkout.razorpay.com/v1/checkout.js', defer: true },
      ],
    },
  },

  routeRules: {
    '/': { ssr: false },
    '/cakes': { ssr: false },
    '/cakes/**': { ssr: false },
    '/cart': { ssr: false },
    '/checkout': { ssr: false },
    '/orders': { ssr: false },
    '/orders/**': { ssr: false },
    '/account': { ssr: false },
    '/addresses': { ssr: false },
    '/wishlist': { ssr: false },
    '/admin': { ssr: false },
    '/admin/**': { ssr: false },
  },

  $development: {
    nitro: {
      devProxy: {
        '/api': {
          target: 'http://localhost:7021/api',
          changeOrigin: true,
        },
      },
    },
  },

  modules: ['@formkit/nuxt'],
})
