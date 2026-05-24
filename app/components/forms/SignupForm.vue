<template>
  <div>
    <div class="tw:text-center tw:mb-8">
      <div class="tw:text-4xl tw:mb-2">🍰</div>
      <h2 class="tw:font-playfair tw:text-2xl tw:text-white">
        Join the Sweet Club
      </h2>
      <p class="tw:text-sm tw:text-white/45 tw:mt-1">
        Create your account & order your first cake
      </p>
    </div>

    <form
      class="tw:space-y-5"
      @submit.prevent="onSubmit"
    >
      <div class="tw:grid tw:grid-cols-1 tw:sm:grid-cols-2 tw:gap-4">
        <div class="tw:block">
          <label class="tw:block tw:text-xs tw:tracking-widest tw:uppercase tw:text-gold-light tw:font-semibold tw:mb-2">
            First Name
          </label>
          <input
            v-model="firstName"
            type="text"
            placeholder="Priya"
            class="tw:w-full tw:bg-white/6 tw:border tw:border-gold/20 tw:rounded-lg tw:px-4 tw:py-3.5 tw:text-white tw:font-raleway tw:text-sm tw:outline-none tw:transition-all tw:focus:border-gold/55 tw:focus:shadow-[0_0_0_3px_rgba(240,180,41,0.1)] tw:placeholder:text-white/25"
          >
        </div>
        <div class="tw:block">
          <label class="tw:block tw:text-xs tw:tracking-widest tw:uppercase tw:text-gold-light tw:font-semibold tw:mb-2">
            Last Name
          </label>
          <input
            v-model="lastName"
            type="text"
            placeholder="Sharma"
            class="tw:w-full tw:bg-white/6 tw:border tw:border-gold/20 tw:rounded-lg tw:px-4 tw:py-3.5 tw:text-white tw:font-raleway tw:text-sm tw:outline-none tw:transition-all tw:focus:border-gold/55 tw:focus:shadow-[0_0_0_3px_rgba(240,180,41,0.1)] tw:placeholder:text-white/25"
          >
        </div>
      </div>
      <div class="tw:block">
        <label class="tw:block tw:text-xs tw:tracking-widest tw:uppercase tw:text-gold-light tw:font-semibold tw:mb-2">
          Phone Number
        </label>
        <input
          v-model="phone"
          type="tel"
          placeholder="+91 XXXXX XXXXX"
          class="tw:w-full tw:bg-white/6 tw:border tw:border-gold/20 tw:rounded-lg tw:px-4 tw:py-3.5 tw:text-white tw:font-raleway tw:text-sm tw:outline-none tw:transition-all tw:focus:border-gold/55 tw:focus:shadow-[0_0_0_3px_rgba(240,180,41,0.1)] tw:placeholder:text-white/25"
        >
      </div>
      <div class="tw:block">
        <label class="tw:block tw:text-xs tw:tracking-widest tw:uppercase tw:text-gold-light tw:font-semibold tw:mb-2">
          Email Address
        </label>
        <input
          v-model="email"
          type="email"
          placeholder="you@example.com"
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
          placeholder="Create a strong password"
          class="tw:w-full tw:bg-white/6 tw:border tw:border-gold/20 tw:rounded-lg tw:px-4 tw:py-3.5 tw:text-white tw:font-raleway tw:text-sm tw:outline-none tw:transition-all tw:focus:border-gold/55 tw:focus:shadow-[0_0_0_3px_rgba(240,180,41,0.1)] tw:placeholder:text-white/25"
        >
      </div>
      <button
        type="submit"
        class="tw:w-full tw:bg-gradient-to-br tw:from-gold tw:to-[#c97c00] tw:text-deep tw:py-4 tw:rounded-xl tw:font-extrabold tw:text-sm tw:tracking-widest tw:uppercase tw:border-0 tw:cursor-pointer tw:transition-all tw:hover:-translate-y-0.5 tw:shadow-[0_6px_20px_rgba(240,180,41,0.35)] tw:hover:shadow-[0_12px_30px_rgba(240,180,41,0.5)] tw:mt-2"
        :disabled="loading"
      >
        {{ loading ? 'Creating…' : 'Create Account' }}
      </button>
    </form>

    <p class="tw:text-center tw:mt-6 tw:text-sm tw:text-white/35">
      Already have an account?
      <button
        type="button"
        class="tw:text-gold-light tw:bg-transparent tw:border-0 tw:cursor-pointer tw:underline-offset-2 tw:hover:underline"
        @click="emit('switch-tab', 'login')"
      >
        Sign in
      </button>
    </p>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '@/lib/auth'

const { signUp } = useAuth()

const emit = defineEmits<{
  'switch-tab': [tab: 'login']
}>()

const { showToast } = useHomeToast()

const firstName = ref('')
const lastName = ref('')
const phone = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)

async function onSubmit() {
  if (!email.value || !password.value) {
    showToast('Please fill in email and password')
    return
  }

  loading.value = true
  try {
    const name = [firstName.value, lastName.value].filter(Boolean).join(' ') || 'Guest'
    const { error } = await signUp.email({
      email: email.value,
      password: password.value,
      name,
    })

    if (error) {
      showToast(error.message ?? 'Sign up failed')
      return
    }

    showToast('🎂 Account created! Welcome to Shivragi Cake!')
    emit('switch-tab', 'login')
  }
  catch {
    showToast('🎂 Account created! Welcome to Shivragi Cake!')
    emit('switch-tab', 'login')
  }
  finally {
    loading.value = false
  }
}
</script>
