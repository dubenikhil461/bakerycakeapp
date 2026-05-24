<script setup lang="ts">
import type { Address } from '~/types/api'

definePageMeta({ ssr: false, middleware: 'auth' })
useHead({ title: 'Saved Addresses – Shivragi' })

const { showToast } = useHomeToast()

const addresses = ref<Address[]>([])
const loading = ref(true)
const showModal = ref(false)
const editingAddress = ref<Address | undefined>()

async function fetchAddresses() {
  loading.value = true
  try {
    const res = await $fetch<{ success: true; data: Address[] }>('/api/addresses', { credentials: 'include' })
    addresses.value = res.data
  } finally {
    loading.value = false
  }
}
await fetchAddresses()

function openAdd() {
  editingAddress.value = undefined
  showModal.value = true
}

function openEdit(addr: Address) {
  editingAddress.value = addr
  showModal.value = true
}

function onSaved() {
  showModal.value = false
  fetchAddresses()
}

async function deleteAddress(id: string) {
  if (!confirm('Delete this address?')) return
  try {
    await $fetch(`/api/addresses/${id}`, { method: 'DELETE', credentials: 'include' })
    addresses.value = addresses.value.filter(a => a.id !== id)
    showToast('Address deleted.')
  } catch {
    showToast('Could not delete address.')
  }
}

async function setDefault(id: string) {
  try {
    await $fetch(`/api/addresses/${id}/default`, { method: 'PATCH', credentials: 'include' })
    await fetchAddresses()
    showToast('Default address updated.')
  } catch {
    showToast('Could not update default.')
  }
}

function formatAddress(a: Address) {
  return [a.line1, a.line2, a.city, a.state, a.pincode].filter(Boolean).join(', ')
}
</script>

<template>
  <div class="tw:max-w-2xl tw:mx-auto tw:px-4 tw:md:px-8 tw:py-12">
    <div class="tw:flex tw:items-center tw:justify-between tw:mb-8">
      <div>
        <button class="tw:text-xs tw:text-white/40 tw:hover:text-white/60 tw:mb-2 tw:transition-colors" @click="$router.push('/account')">← My Account</button>
        <h1 class="tw:font-playfair tw:text-3xl tw:text-gold-light">Saved Addresses</h1>
      </div>
      <AppButton variant="gold" size="sm" @click="openAdd">+ Add New</AppButton>
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="tw:space-y-3">
      <div v-for="i in 3" :key="i" class="tw:h-28 tw:bg-white/4 tw:border tw:border-gold/10 tw:rounded-2xl tw:animate-pulse" />
    </div>

    <!-- Empty -->
    <AppEmptyState
      v-else-if="!addresses.length"
      icon="📍"
      title="No saved addresses"
      description="Add an address to speed up checkout."
      action-label="Add Address"
      @click="openAdd"
    />

    <!-- Address cards -->
    <div v-else class="tw:space-y-3">
      <div
        v-for="addr in addresses"
        :key="addr.id"
        class="tw:bg-white/4 tw:border tw:border-gold/10 tw:rounded-2xl tw:p-5"
      >
        <div class="tw:flex tw:items-start tw:gap-4">
          <div class="tw:flex-1 tw:min-w-0">
            <div class="tw:flex tw:items-center tw:gap-2 tw:mb-1 tw:flex-wrap">
              <span class="tw:font-semibold tw:text-cream">{{ addr.fullName }}</span>
              <span v-if="addr.isDefault" class="tw:text-xs tw:bg-gold/20 tw:text-gold tw:px-2 tw:rounded-full tw:border tw:border-gold/30">Default</span>
              <span class="tw:text-xs tw:text-white/35 tw:capitalize">{{ addr.addressType }}</span>
            </div>
            <p class="tw:text-sm tw:text-white/55 tw:leading-relaxed">{{ formatAddress(addr) }}</p>
            <p class="tw:text-sm tw:text-white/40 tw:mt-0.5">{{ addr.phone }}</p>
          </div>
        </div>
        <div class="tw:flex tw:gap-3 tw:mt-4 tw:pt-4 tw:border-t tw:border-white/6">
          <button
            class="tw:text-xs tw:text-gold/70 tw:hover:text-gold tw:transition-colors"
            @click="openEdit(addr)"
          >
            Edit
          </button>
          <button
            v-if="!addr.isDefault"
            class="tw:text-xs tw:text-white/40 tw:hover:text-white/60 tw:transition-colors"
            @click="setDefault(addr.id)"
          >
            Set as Default
          </button>
          <button
            v-if="!addr.isDefault"
            class="tw:text-xs tw:text-red-400/60 tw:hover:text-red-400 tw:transition-colors tw:ml-auto"
            @click="deleteAddress(addr.id)"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <AppModal
      :open="showModal"
      :title="editingAddress ? 'Edit Address' : 'Add New Address'"
      @close="showModal = false"
    >
      <FormsAddressForm
        :address="editingAddress"
        @saved="onSaved"
        @cancel="showModal = false"
      />
    </AppModal>
  </div>
</template>
