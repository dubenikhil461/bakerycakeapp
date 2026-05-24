<template>
  <div>
    <div class="tw:text-center tw:mb-8">
      <div class="tw:text-4xl tw:mb-2">🎂</div>
      <h2 class="tw:font-playfair tw:text-2xl tw:text-white">
        Welcome Back!
      </h2>
      <p class="tw:text-sm tw:text-white/45 tw:mt-1">
        Sign in to place your sweet order
      </p>
    </div>

    <form
      class="tw:space-y-5"
      @submit.prevent="onSubmit"
    >
      <div class="tw:block">
        <label class="tw:block tw:text-xs tw:tracking-widest tw:uppercase tw:text-gold-light tw:font-semibold tw:mb-2">
          Phone / Email
        </label>
        <input
          v-model="identifier"
          type="text"
          placeholder="Enter your phone or email"
          class="tw:w-full tw:bg-white/6 tw:border tw:border-gold/20 tw:rounded-lg tw:px-4 tw:py-3.5 tw:text-white tw:font-raleway tw:text-sm tw:outline-none tw:transition-all tw:focus:border-gold/55 tw:focus:shadow-[0_0_0_3px_rgba(240,180,41,0.1)] tw:placeholder:text-white/25"
        >
      </div>
      <div class="tw:block">
        <label class="tw:block tw:text-xs tw:tracking-widest tw:uppercase tw:text-gold-light tw:font-semibold tw:mb-2">
          Password
        </label>
        <input
          v-model="password"
          type="password"
          placeholder="Your password"
          class="tw:w-full tw:bg-white/6 tw:border tw:border-gold/20 tw:rounded-lg tw:px-4 tw:py-3.5 tw:text-white tw:font-raleway tw:text-sm tw:outline-none tw:transition-all tw:focus:border-gold/55 tw:focus:shadow-[0_0_0_3px_rgba(240,180,41,0.1)] tw:placeholder:text-white/25"
        >
      </div>
      <button
        type="submit"
        class="tw:w-full tw:bg-gradient-to-br tw:from-gold tw:to-[#c97c00] tw:text-deep tw:py-4 tw:rounded-xl tw:font-extrabold tw:text-sm tw:tracking-widest tw:uppercase tw:border-0 tw:cursor-pointer tw:transition-all tw:hover:-translate-y-0.5 tw:shadow-[0_6px_20px_rgba(240,180,41,0.35)] tw:hover:shadow-[0_12px_30px_rgba(240,180,41,0.5)] tw:mt-2"
        :disabled="loading"
      >
        {{ loading ? 'Signing in…' : 'Sign In' }}
      </button>
    </form>

    <div class="tw:flex tw:items-center tw:gap-4 tw:my-6 tw:text-xs tw:tracking-wide tw:uppercase tw:text-white/25">
      <span class="tw:flex-1 tw:h-px tw:bg-white/10" />
      or continue with
      <span class="tw:flex-1 tw:h-px tw:bg-white/10" />
    </div>

    <button
      type="button"
      class="tw:w-full tw:bg-transparent tw:text-gold-light tw:py-3 tw:rounded-full tw:font-semibold tw:text-sm tw:tracking-widest tw:uppercase tw:border tw:border-gold/40 tw:cursor-pointer tw:transition-all tw:hover:border-gold tw:hover:bg-gold/8"
      @click="showToast('📱 OTP login coming soon!')"
    >
      📲 Login with OTP
    </button>

    <p class="tw:text-center tw:mt-6 tw:text-sm tw:text-white/35">
      Don't have an account?
      <button
        type="button"
        class="tw:text-gold-light tw:bg-transparent tw:border-0 tw:cursor-pointer tw:underline-offset-2 tw:hover:underline"
        @click="emit('switch-tab', 'signup')"
      >
        Create one
      </button>
    </p>
  </div>
</template>

<script setup lang="ts">
import { useAuth  } from '@/lib/auth'

const { signIn } = useAuth()

const emit = defineEmits<{
  'switch-tab': [tab: 'signup']
}>()

const { showToast } = useHomeToast()

const identifier = ref('')
const password = ref('')
const loading = ref(false)

async function onSubmit() {
  if (!identifier.value || !password.value) {
    showToast('Please enter your email and password')
    return
  }

  loading.value = true
  try {
    const { error } = await signIn.email({
      email: identifier.value,
      password: password.value,
    })

    if (error) {
      showToast(error.message ?? 'Sign in failed')
      return
    }

    showToast('🎉 Welcome back! Redirecting...')
  }
  catch {
    showToast('🎉 Welcome back! Redirecting...')
  }
  finally {
    loading.value = false
  }
}
</script>
