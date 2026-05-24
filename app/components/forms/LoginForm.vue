<template>
  <div>
    <div class="tw:text-center tw:mb-8">
      <div class="tw:text-4xl tw:mb-2">🎂</div>
      <h2 class="tw:font-playfair tw:text-2xl tw:text-white">
        {{ step === 'email' ? 'Welcome!' : 'Check Your Email' }}
      </h2>
      <p class="tw:text-sm tw:text-white/45 tw:mt-1">
        {{ step === 'email'
          ? 'Enter your email to receive a one-time code'
          : `We sent a 6-digit code to ${email}` }}
      </p>
    </div>

    <!-- Step 1: Email -->
    <form
      v-if="step === 'email'"
      class="tw:space-y-5"
      @submit.prevent="sendOtp"
    >
      <div class="tw:block">
        <label class="tw:block tw:text-xs tw:tracking-widest tw:uppercase tw:text-gold-light tw:font-semibold tw:mb-2">
          Email Address
        </label>
        <input
          v-model="email"
          type="email"
          placeholder="you@example.com"
          autocomplete="email"
          class="tw:w-full tw:bg-white/6 tw:border tw:border-gold/20 tw:rounded-lg tw:px-4 tw:py-3.5 tw:text-white tw:font-raleway tw:text-sm tw:outline-none tw:transition-all tw:focus:border-gold/55 tw:focus:shadow-[0_0_0_3px_rgba(240,180,41,0.1)] tw:placeholder:text-white/25"
        >
      </div>
      <button
        type="submit"
        :disabled="loading || !email"
        class="tw:w-full tw:bg-gradient-to-br tw:from-gold tw:to-[#c97c00] tw:text-deep tw:py-4 tw:rounded-xl tw:font-extrabold tw:text-sm tw:tracking-widest tw:uppercase tw:border-0 tw:cursor-pointer tw:transition-all tw:hover:-translate-y-0.5 tw:shadow-[0_6px_20px_rgba(240,180,41,0.35)] tw:hover:shadow-[0_12px_30px_rgba(240,180,41,0.5)] tw:mt-2 tw:disabled:opacity-50 tw:disabled:cursor-not-allowed tw:disabled:hover:translate-y-0"
      >
        {{ loading ? 'Sending…' : '📲 Send OTP' }}
      </button>
    </form>

    <!-- Step 2: OTP -->
    <form
      v-else
      class="tw:space-y-5"
      @submit.prevent="verifyOtp"
    >
      <div class="tw:block">
        <label class="tw:block tw:text-xs tw:tracking-widest tw:uppercase tw:text-gold-light tw:font-semibold tw:mb-2">
          One-Time Code
        </label>
        <input
          ref="otpInput"
          v-model="otp"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength="6"
          placeholder="••••••"
          autocomplete="one-time-code"
          class="tw:w-full tw:bg-white/6 tw:border tw:border-gold/20 tw:rounded-lg tw:px-4 tw:py-3.5 tw:text-white tw:font-raleway tw:text-lg tw:tracking-[0.4em] tw:text-center tw:outline-none tw:transition-all tw:focus:border-gold/55 tw:focus:shadow-[0_0_0_3px_rgba(240,180,41,0.1)] tw:placeholder:text-white/25 tw:placeholder:tracking-normal"
        >
      </div>
      <button
        type="submit"
        :disabled="loading || otp.length < 6"
        class="tw:w-full tw:bg-gradient-to-br tw:from-gold tw:to-[#c97c00] tw:text-deep tw:py-4 tw:rounded-xl tw:font-extrabold tw:text-sm tw:tracking-widest tw:uppercase tw:border-0 tw:cursor-pointer tw:transition-all tw:hover:-translate-y-0.5 tw:shadow-[0_6px_20px_rgba(240,180,41,0.35)] tw:hover:shadow-[0_12px_30px_rgba(240,180,41,0.5)] tw:mt-2 tw:disabled:opacity-50 tw:disabled:cursor-not-allowed tw:disabled:hover:translate-y-0"
      >
        {{ loading ? 'Verifying…' : '✅ Verify & Sign In' }}
      </button>

      <div class="tw:flex tw:items-center tw:justify-between tw:pt-1">
        <button
          type="button"
          class="tw:text-white/40 tw:bg-transparent tw:border-0 tw:cursor-pointer tw:text-sm tw:hover:text-white/70 tw:transition-colors"
          @click="goBack"
        >
          ← Change email
        </button>
        <button
          type="button"
          :disabled="resendCooldown > 0"
          class="tw:text-gold-light tw:bg-transparent tw:border-0 tw:cursor-pointer tw:text-sm tw:hover:text-gold tw:transition-colors tw:disabled:opacity-40 tw:disabled:cursor-not-allowed"
          @click="sendOtp"
        >
          {{ resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '@/lib/auth'

const { emailOtp, signIn } = useAuth()
const { showToast } = useHomeToast()

type Step = 'email' | 'otp'

const step = ref<Step>('email')
const email = ref('')
const otp = ref('')
const loading = ref(false)
const resendCooldown = ref(0)
const otpInput = ref<HTMLInputElement | null>(null)

let cooldownTimer: ReturnType<typeof setInterval> | null = null

async function sendOtp() {
  if (!email.value) return

  loading.value = true
  try {
    const { error } = await emailOtp.sendVerificationOtp({
      email: email.value,
      type: 'sign-in',
    })

    if (error) {
      showToast(error.message ?? 'Failed to send OTP')
      return
    }

    step.value = 'otp'
    otp.value = ''
    startResendCooldown()
    showToast('📬 OTP sent! Check your inbox.')

    await nextTick()
    otpInput.value?.focus()
  }
  catch {
    showToast('Failed to send OTP. Please try again.')
  }
  finally {
    loading.value = false
  }
}

async function verifyOtp() {
  if (otp.value.length < 6) return

  loading.value = true
  try {
    const { error } = await signIn.emailOtp({
      email: email.value,
      otp: otp.value,
    })

    if (error) {
      showToast(error.message ?? 'Invalid or expired code')
      otp.value = ''
      return
    }

    showToast('🎉 Welcome! Redirecting...')
  }
  catch {
    showToast('🎉 Welcome! Redirecting...')
  }
  finally {
    loading.value = false
  }
}

function goBack() {
  step.value = 'email'
  otp.value = ''
  clearCooldown()
}

function startResendCooldown(seconds = 60) {
  clearCooldown()
  resendCooldown.value = seconds
  cooldownTimer = setInterval(() => {
    resendCooldown.value -= 1
    if (resendCooldown.value <= 0) clearCooldown()
  }, 1000)
}

function clearCooldown() {
  if (cooldownTimer) {
    clearInterval(cooldownTimer)
    cooldownTimer = null
  }
  resendCooldown.value = 0
}

onUnmounted(clearCooldown)
</script>
