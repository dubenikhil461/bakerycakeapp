<script setup lang="ts">
import type { Review } from '~/types/api'

const props = defineProps<{
  cakeId: string
  existingReview?: Review
}>()
const emit = defineEmits<{
  saved: []
  cancel: []
}>()

const submitting = ref(false)
const error = ref('')
const ratingError = ref('')

const form = reactive({
  rating: props.existingReview?.rating ?? 0,
  title: props.existingReview?.title ?? '',
  body: props.existingReview?.body ?? '',
})

function onRatingChange(val: number) {
  form.rating = val
  ratingError.value = ''
}

async function submit() {
  // Rating uses a custom star component – validate manually
  if (!form.rating) {
    ratingError.value = 'Please select a rating.'
    return
  }
  submitting.value = true
  error.value = ''
  try {
    if (props.existingReview) {
      await $fetch(`/api/reviews/${props.existingReview.id}`, {
        method: 'PUT',
        credentials: 'include',
        body: form,
      })
    }
    else {
      await $fetch('/api/reviews', {
        method: 'POST',
        credentials: 'include',
        body: { ...form, cakeId: props.cakeId },
      })
    }
    emit('saved')
  }
  catch (e: any) {
    error.value = e?.data?.error ?? 'Failed to submit review.'
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <FormKit
    type="form"
    :actions="false"
    :classes="{ form: 'tw:space-y-5' }"
    @submit="submit"
  >
    <!-- Rating – custom star component, not a FormKit input -->
    <div>
      <label class="tw:block tw:text-xs tw:text-white/40 tw:uppercase tw:tracking-wider tw:mb-2">
        Your Rating *
      </label>
      <AppRatingStars :value="form.rating" :interactive="true" size="lg" @update:value="onRatingChange" />
      <p v-if="ratingError" class="tw:text-xs tw:text-red-400 tw:flex tw:items-center tw:gap-1 tw:mt-1.5">
        <span class="tw:text-[7px] tw:leading-none">▲</span>{{ ratingError }}
      </p>
    </div>

    <FormKit
      v-model="form.title"
      type="text"
      name="title"
      label="Title"
      placeholder="Summarise your experience"
      :attrs="{ maxlength: '200' }"
    />

    <div>
      <FormKit
        v-model="form.body"
        type="textarea"
        name="body"
        label="Review"
        placeholder="Tell us more about this cake..."
        :attrs="{ maxlength: '2000', rows: '4' }"
      />
      <p class="tw:text-xs tw:text-white/25 tw:text-right tw:mt-0.5">{{ form.body.length }}/2000</p>
    </div>

    <p v-if="error" class="tw:text-red-400 tw:text-sm">{{ error }}</p>

    <div class="tw:flex tw:gap-3 tw:justify-end">
      <AppButton variant="ghost" type="button" @click="emit('cancel')">Cancel</AppButton>
      <AppButton variant="gold" type="submit" :loading="submitting">
        {{ existingReview ? 'Update Review' : 'Submit Review' }}
      </AppButton>
    </div>
  </FormKit>
</template>
