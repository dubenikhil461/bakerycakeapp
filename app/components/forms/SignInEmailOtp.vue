<template>
  <div>
    <div class="tw:text-center tw:mb-8">
      <div class="tw:text-4xl tw:mb-2">🎂</div>
      <h2 class="tw:font-playfair tw:text-2xl tw:text-white">
        {{ step === 'email' ? 'Welcome Back!' : 'Enter your code' }}
      </h2>
      <p class="tw:text-sm tw:text-white/45 tw:mt-1">
        <template v-if="step === 'email'">
          Sign in with a one-time code sent to your email
        </template>
        <template v-else>
          We sent a 6-digit code to <span class="tw:text-gold-light">{{ email }}</span>
        </template>
      </p>
    </div>

    <!-- Step 1: email -->
    <form
      v-if="step === 'email'"
      class="tw:space-y-5"
      @submit.prevent="sendOtp"
    >
      <div>
        <label class="tw:block tw:text-xs tw:tracking-widest tw:uppercase tw:text-gold-light tw:font-semibold tw:mb-2">
          Email address
        </label>
        <input
          v-model="email"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          required
          class="tw:w-full tw:bg-white/6 tw:border tw:border-gold/20 tw:rounded-lg tw:px-4 tw:py-3.5 tw:text-white tw:font-raleway tw:text-sm tw:outline-none tw:transition-all tw:focus:border-gold/55 tw:focus:shadow-[0_0_0_3px_rgba(240,180,41,0.1)] tw:placeholder:text-white/25"
        >
      </div>
      <button
        type="submit"
        class="tw:w-full tw:bg-gradient-to-br tw:from-gold tw:to-[#c97c00] tw:text-deep tw:py-4 tw:rounded-xl tw:font-extrabold tw:text-sm tw:tracking-widest tw:uppercase tw:border-0 tw:cursor-pointer tw:transition-all tw:hover:-translate-y-0.5 tw:shadow-[0_6px_20px_rgba(240,180,41,0.35)] tw:hover:shadow-[0_12px_30px_rgba(240,180,41,0.5)] tw:disabled:opacity-60 tw:disabled:cursor-not-allowed"
        :disabled="sending"
      >
        {{ sending ? 'Sending…' : 'Send code' }}
      </button>
    </form>

    <!-- Step 2: OTP -->
    <form
      v-else
      class="tw:space-y-5"
      @submit.prevent="verifyAndSignIn"
    >
      <div>
        <label class="tw:block tw:text-xs tw:tracking-widest tw:uppercase tw:text-gold-light tw:font-semibold tw:mb-2">
          One-time code
        </label>
        <input
          v-model="otp"
          type="text"
          inputmode="numeric"
          autocomplete="one-time-code"
          placeholder="123456"
          maxlength="8"
          required
          class="tw:w-full tw:bg-white/6 tw:border tw:border-gold/20 tw:rounded-lg tw:px-4 tw:py-3.5 tw:text-white tw:font-raleway tw:text-sm tw:tracking-[0.3em] tw:text-center tw:outline-none tw:transition-all tw:focus:border-gold/55 tw:focus:shadow-[0_0_0_3px_rgba(240,180,41,0.1)] tw:placeholder:text-white/25 tw:placeholder:tracking-normal"
        >
      </div>
      <button
        type="submit"
        class="tw:w-full tw:bg-gradient-to-br tw:from-gold tw:to-[#c97c00] tw:text-deep tw:py-4 tw:rounded-xl tw:font-extrabold tw:text-sm tw:tracking-widest tw:uppercase tw:border-0 tw:cursor-pointer tw:transition-all tw:hover:-translate-y-0.5 tw:shadow-[0_6px_20px_rgba(240,180,41,0.35)] tw:hover:shadow-[0_12px_30px_rgba(240,180,41,0.5)] tw:disabled:opacity-60 tw:disabled:cursor-not-allowed"
        :disabled="verifying"
      >
        {{ verifying ? 'Signing in…' : 'Sign in' }}
      </button>
      <div class="tw:flex tw:flex-col tw:gap-2 tw:text-center tw:text-sm">
        <button
          type="button"
          class="tw:text-gold-light tw:bg-transparent tw:border-0 tw:cursor-pointer tw:hover:underline"
          :disabled="sending"
          @click="sendOtp"
        >
          Resend code
        </button>
        <button
          type="button"
          class="tw:text-white/35 tw:bg-transparent tw:border-0 tw:cursor-pointer tw:hover:text-white/60"
          @click="goBackToEmail"
        >
          Use a different email
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/lib/auth'

const { emailOtp, signIn } = useAuth()
const { showToast } = useHomeToast()
const router = useRouter()

const step = ref<'email' | 'otp'>('email')
const email = ref('')
const otp = ref('')
const sending = ref(false)
const verifying = ref(false)

async function sendOtp() {
  const trimmed = email.value.trim()
  if (!trimmed) {
    showToast('Please enter your email address')
    return
  }

  sending.value = true
  try {
    const { error } = await emailOtp.sendVerificationOtp({
      email: trimmed,
      type: 'sign-in',
    })

    if (error) {
      showToast(error.message ?? 'Could not send code. Please try again.')
      return
    }

    email.value = trimmed
    step.value = 'otp'
    showToast('📧 Check your email for the sign-in code')
  }
  finally {
    sending.value = false
  }
}

async function verifyAndSignIn() {
  const trimmedEmail = email.value.trim()
  const trimmedOtp = otp.value.trim()

  if (!trimmedOtp) {
    showToast('Please enter the code from your email')
    return
  }

  verifying.value = true
  try {
    const payload: { email: string, otp: string } = {
      email: trimmedEmail,
      otp: trimmedOtp,
    }

    const { error } = await signIn.emailOtp(payload)

    if (error) {
      showToast(error.message ?? 'Invalid or expired code. Please try again.')
      return
    }

    showToast('🎉 Welcome back!')
    await router.push('/')
  }
  finally {
    verifying.value = false
  }
}

function goBackToEmail() {
  step.value = 'email'
  otp.value = ''
}
</script>
