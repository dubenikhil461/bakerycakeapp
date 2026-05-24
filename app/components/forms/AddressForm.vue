<script setup lang="ts">
import type { Address, AddressType } from '~/types/api'

const props = defineProps<{
  address?: Address
}>()
const emit = defineEmits<{
  saved: [addr: Address]
  cancel: []
}>()

const submitting = ref(false)
const error = ref('')

const form = reactive({
  fullName: props.address?.fullName ?? '',
  phone: props.address?.phone ?? '',
  line1: props.address?.line1 ?? '',
  line2: props.address?.line2 ?? '',
  city: props.address?.city ?? '',
  state: props.address?.state ?? '',
  pincode: props.address?.pincode ?? '',
  country: props.address?.country ?? 'India',
  addressType: (props.address?.addressType ?? 'home') as AddressType,
  isDefault: props.address?.isDefault ?? false,
})

async function submit() {
  submitting.value = true
  error.value = ''
  try {
    const url = props.address ? `/api/addresses/${props.address.id}` : '/api/addresses'
    const method = props.address ? 'PUT' : 'POST'
    const res = await $fetch<{ success: true; data: Address }>(url, {
      method,
      credentials: 'include',
      body: form,
    })
    emit('saved', res.data)
  }
  catch (e: any) {
    error.value = e?.data?.error ?? 'Failed to save address.'
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
    :classes="{ form: 'tw:space-y-4' }"
    @submit="submit"
  >
    <div class="tw:grid tw:grid-cols-2 tw:gap-3">
      <FormKit
        v-model="form.fullName"
        type="text"
        name="fullName"
        label="Full Name *"
        validation="required"
        :validation-messages="{ required: 'Full name is required' }"
      />
      <FormKit
        v-model="form.phone"
        type="text"
        name="phone"
        label="Phone *"
        :validation="[['required'], ['matches', /^[+\d\s\-]{7,15}$/]]"
        :validation-messages="{
          required: 'Phone number is required',
          matches: 'Enter a valid phone number (7–15 digits)',
        }"
      />
    </div>

    <FormKit
      v-model="form.line1"
      type="text"
      name="line1"
      label="Address Line 1 *"
      placeholder="House / Flat, Street"
      validation="required"
      :validation-messages="{ required: 'Address line 1 is required' }"
    />

    <FormKit
      v-model="form.line2"
      type="text"
      name="line2"
      label="Address Line 2"
      placeholder="Landmark, Area (optional)"
    />

    <div class="tw:grid tw:grid-cols-3 tw:gap-3">
      <FormKit
        v-model="form.city"
        type="text"
        name="city"
        label="City *"
        validation="required"
        :validation-messages="{ required: 'City is required' }"
      />
      <FormKit
        v-model="form.state"
        type="text"
        name="state"
        label="State *"
        validation="required"
        :validation-messages="{ required: 'State is required' }"
      />
      <FormKit
        v-model="form.pincode"
        type="text"
        name="pincode"
        label="Pincode *"
        :validation="[['required'], ['matches', /^[0-9]{4,10}$/]]"
        :validation-messages="{
          required: 'Pincode is required',
          matches: 'Enter a valid pincode (4–10 digits)',
        }"
      />
    </div>

    <div class="tw:flex tw:items-center tw:gap-4">
      <FormKit
        v-model="form.addressType"
        type="select"
        name="addressType"
        label="Type"
        :options="[
          { value: 'home', label: 'Home' },
          { value: 'office', label: 'Office' },
          { value: 'other', label: 'Other' },
        ]"
      />
      <label class="tw:flex tw:items-center tw:gap-2 tw:cursor-pointer tw:mt-4">
        <input v-model="form.isDefault" type="checkbox" class="tw:accent-gold" />
        <span class="tw:text-sm tw:text-white/60">Set as default</span>
      </label>
    </div>

    <p v-if="error" class="tw:text-red-400 tw:text-sm">{{ error }}</p>

    <div class="tw:flex tw:gap-3 tw:justify-end tw:pt-2">
      <AppButton variant="ghost" type="button" @click="emit('cancel')">Cancel</AppButton>
      <AppButton variant="gold" type="submit" :loading="submitting">
        {{ address ? 'Save Changes' : 'Add Address' }}
      </AppButton>
    </div>
  </FormKit>
</template>
