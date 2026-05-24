<script setup lang="ts">
import type { Category, CakeVariant } from '~/types/api'

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin'] })

const route = useRoute()
const router = useRouter()
const { showToast } = useAdminToast()
const isNew = route.params.id === 'new'

useHead({ title: `${isNew ? 'New Cake' : 'Edit Cake'} – Admin` })

// Load categories
const { data: catData } = await useFetch<any>('/api/admin/categories', { credentials: 'include' })
const categories = computed<Category[]>(() => catData.value?.data ?? [])

// Load cake if editing
let initialCake: any = null
if (!isNew) {
  const res = await $fetch<any>(`/api/admin/cakes/${route.params.id}`, { credentials: 'include' })
  initialCake = res.data
}

if (!isNew && !initialCake) throw createError({ statusCode: 404 })

const form = reactive({
  name: initialCake?.name ?? '',
  slug: initialCake?.slug ?? '',
  basePrice: initialCake?.basePrice ?? '',
  shortDescription: initialCake?.shortDescription ?? '',
  description: initialCake?.description ?? '',
  categoryId: initialCake?.category?.id ?? '',
  isFeatured: initialCake?.isFeatured ?? false,
  isActive: initialCake?.isActive ?? true,
  metaTitle: initialCake?.metaTitle ?? '',
  metaDescription: initialCake?.metaDescription ?? '',
})

const saving = ref(false)
const saveError = ref('')
let cakeId = initialCake?.id as string | undefined

async function saveBasicInfo() {
  saving.value = true
  saveError.value = ''
  try {
    if (isNew) {
      const res = await $fetch<any>('/api/admin/cakes', {
        method: 'POST',
        credentials: 'include',
        body: form,
      })
      cakeId = res.data.id
      showToast('Cake created!')
      router.replace(`/admin/cakes/${cakeId}`)
    } else {
      await $fetch(`/api/admin/cakes/${cakeId}`, {
        method: 'PUT',
        credentials: 'include',
        body: form,
      })
      showToast('Cake updated.')
    }
  } catch (e: any) {
    saveError.value = e?.data?.error ?? 'Failed to save.'
  } finally {
    saving.value = false
  }
}

// ─── Images ───────────────────────────────────────────────────────────────────
const images = ref<any[]>(initialCake?.images ?? [])
const uploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

async function uploadImage(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !cakeId) return
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    const uploadRes = await $fetch<any>('/api/admin/uploads', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })
    await $fetch(`/api/admin/cakes/${cakeId}/images`, {
      method: 'POST',
      credentials: 'include',
      body: { uploadId: uploadRes.data.id, isPrimary: images.value.length === 0 },
    })
    // Refresh cake to get updated images
    const refreshed = await $fetch<any>(`/api/admin/cakes/${cakeId}`, { credentials: 'include' })
    images.value = refreshed.data.images ?? []
    showToast('Image uploaded.')
  } catch (e: any) {
    showToast(e?.data?.error ?? 'Upload failed.', 'error')
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

async function deleteImage(imageId: string) {
  if (!cakeId) return
  try {
    await $fetch(`/api/admin/cakes/${cakeId}/images/${imageId}`, { method: 'DELETE', credentials: 'include' })
    images.value = images.value.filter(i => i.id !== imageId)
    showToast('Image removed.')
  } catch { showToast('Failed to remove.', 'error') }
}

async function setPrimary(imageId: string) {
  if (!cakeId) return
  try {
    await $fetch(`/api/admin/cakes/${cakeId}/images/${imageId}/primary`, { method: 'PATCH', credentials: 'include' })
    images.value = images.value.map(i => ({ ...i, isPrimary: i.id === imageId }))
    showToast('Primary image set.')
  } catch { showToast('Failed.', 'error') }
}

// ─── Variants ─────────────────────────────────────────────────────────────────
const variants = ref<CakeVariant[]>(initialCake?.variants ?? [])
const showVariantForm = ref(false)
const editingVariant = ref<CakeVariant | undefined>()

const variantForm = reactive({
  variantType: 'size' as 'size' | 'weight' | 'flavor' | 'tier',
  name: '',
  priceModifier: '0',
  stockQty: 0,
  sku: '',
  isActive: true,
})

function openVariantForm(v?: CakeVariant) {
  editingVariant.value = v
  variantForm.variantType = v?.variantType ?? 'size'
  variantForm.name = v?.name ?? ''
  variantForm.priceModifier = v?.priceModifier ?? '0'
  variantForm.stockQty = v?.stockQty ?? 0
  variantForm.sku = v?.sku ?? ''
  variantForm.isActive = v?.isActive ?? true
  showVariantForm.value = true
}

const savingVariant = ref(false)

async function saveVariant() {
  if (!cakeId) return
  savingVariant.value = true
  try {
    if (editingVariant.value) {
      const res = await $fetch<any>(`/api/admin/cakes/${cakeId}/variants/${editingVariant.value.id}`, {
        method: 'PUT',
        credentials: 'include',
        body: variantForm,
      })
      const idx = variants.value.findIndex(v => v.id === editingVariant.value!.id)
      if (idx !== -1) variants.value[idx] = res.data
    } else {
      const res = await $fetch<any>(`/api/admin/cakes/${cakeId}/variants`, {
        method: 'POST',
        credentials: 'include',
        body: variantForm,
      })
      variants.value.push(res.data)
    }
    showVariantForm.value = false
    showToast('Variant saved.')
  } catch (e: any) {
    showToast(e?.data?.error ?? 'Failed to save variant.', 'error')
  } finally {
    savingVariant.value = false
  }
}

async function deleteVariant(variantId: string) {
  if (!cakeId) return
  try {
    await $fetch(`/api/admin/cakes/${cakeId}/variants/${variantId}`, { method: 'DELETE', credentials: 'include' })
    variants.value = variants.value.filter(v => v.id !== variantId)
    showToast('Variant removed.')
  } catch { showToast('Failed.', 'error') }
}

// ─── Delete Cake ──────────────────────────────────────────────────────────────
const showDeleteConfirm = ref(false)
const deleting = ref(false)

async function deleteCake() {
  if (!cakeId) return
  deleting.value = true
  try {
    await $fetch(`/api/admin/cakes/${cakeId}`, { method: 'DELETE', credentials: 'include' })
    showToast('Cake permanently deleted.')
    router.replace('/admin/cakes')
  } catch (e: any) {
    showToast(e?.data?.error ?? 'Failed to delete cake.', 'error')
    showDeleteConfirm.value = false
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div>
    <button class="tw:text-xs tw:text-white/40 tw:hover:text-white/60 tw:mb-4" @click="router.push('/admin/cakes')">← Cakes</button>
    <h1 class="tw:font-playfair tw:text-2xl tw:text-gold-light tw:mb-8">{{ isNew ? 'New Cake' : 'Edit Cake' }}</h1>

    <div class="tw:grid tw:grid-cols-1 tw:lg:grid-cols-3 tw:gap-6">
      <!-- Left: Main form -->
      <div class="tw:lg:col-span-2 tw:space-y-5">

        <!-- Basic info -->
        <div class="tw:bg-white/4 tw:border tw:border-gold/15 tw:rounded-2xl tw:p-5">
          <h2 class="tw:font-semibold tw:text-white/80 tw:mb-4">Basic Info</h2>

          <FormKit
            type="form"
            :actions="false"
            :classes="{ form: 'tw:space-y-4' }"
            @submit="saveBasicInfo"
          >
            <div class="tw:grid tw:grid-cols-2 tw:gap-3">
              <FormKit
                v-model="form.name"
                type="text"
                name="name"
                label="Name *"
                validation="required"
                :validation-messages="{ required: 'Cake name is required' }"
              />
              <FormKit
                v-model="form.basePrice"
                type="number"
                name="basePrice"
                label="Base Price (₹) *"
                validation="required|min:0"
                :validation-messages="{
                  required: 'Base price is required',
                  min: 'Price must be at least 0',
                }"
                :attrs="{ min: '0', step: '0.01' }"
              />
            </div>

            <div class="tw:grid tw:grid-cols-2 tw:gap-3">
              <FormKit
                v-model="form.slug"
                type="text"
                name="slug"
                label="Slug"
                placeholder="auto"
              />
              <FormKit
                v-model="form.categoryId"
                type="select"
                name="categoryId"
                label="Category"
                :options="[
                  { value: '', label: 'None' },
                  ...categories.map(c => ({ value: c.id, label: c.name })),
                ]"
              />
            </div>

            <FormKit
              v-model="form.shortDescription"
              type="text"
              name="shortDescription"
              label="Short Description"
              :attrs="{ maxlength: '300' }"
            />

            <FormKit
              v-model="form.description"
              type="textarea"
              name="description"
              label="Description"
              :attrs="{ rows: '4' }"
            />

            <div class="tw:flex tw:gap-6">
              <label class="tw:flex tw:items-center tw:gap-2 tw:cursor-pointer">
                <input v-model="form.isActive" type="checkbox" class="tw:accent-gold" />
                <span class="tw:text-sm tw:text-white/60">Active</span>
              </label>
            </div>

            <p v-if="saveError" class="tw:text-red-400 tw:text-sm">{{ saveError }}</p>
            <AppButton variant="gold" size="md" type="submit" :loading="saving">
              {{ isNew ? 'Create Cake' : 'Save Changes' }}
            </AppButton>
          </FormKit>
        </div>

        <!-- Images (only if cake already exists) -->
        <div v-if="!isNew" class="tw:bg-white/4 tw:border tw:border-gold/15 tw:rounded-2xl tw:p-5 tw:space-y-4">
          <div class="tw:flex tw:items-center tw:justify-between">
            <h2 class="tw:font-semibold tw:text-white/80">Images</h2>
            <label class="tw:cursor-pointer tw:flex tw:items-center tw:gap-1.5 tw:text-xs tw:text-gold/70 tw:hover:text-gold tw:transition-colors">
              <AppSpinner v-if="uploading" size="sm" />
              <span v-else>+ Upload</span>
              <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" class="tw:hidden" @change="uploadImage" />
            </label>
          </div>
          <div v-if="images.length" class="tw:flex tw:flex-wrap tw:gap-3">
            <div v-for="img in images" :key="img.id" class="tw:relative tw:w-20 tw:h-20 tw:rounded-xl tw:overflow-hidden tw:group">
              <img :src="img.url" :alt="img.altText ?? ''" class="tw:w-full tw:h-full tw:object-cover" />
              <div v-if="img.isPrimary" class="tw:absolute tw:bottom-0 tw:inset-x-0 tw:text-center tw:text-xs tw:bg-gold tw:text-deep tw:font-bold tw:py-0.5">Primary</div>
              <div class="tw:absolute tw:inset-0 tw:bg-black/60 tw:opacity-0 tw:group-hover:opacity-100 tw:transition-opacity tw:flex tw:flex-col tw:items-center tw:justify-center tw:gap-1">
                <button v-if="!img.isPrimary" class="tw:text-xs tw:text-gold" @click="setPrimary(img.id)">Set Primary</button>
                <button class="tw:text-xs tw:text-red-400" @click="deleteImage(img.id)">Remove</button>
              </div>
            </div>
          </div>
          <p v-else class="tw:text-sm tw:text-white/35">No images yet. Upload one above.</p>
        </div>

        <!-- Variants (only if cake exists) -->
        <div v-if="!isNew" class="tw:bg-white/4 tw:border tw:border-gold/15 tw:rounded-2xl tw:p-5 tw:space-y-4">
          <div class="tw:flex tw:items-center tw:justify-between">
            <h2 class="tw:font-semibold tw:text-white/80">Variants</h2>
            <AppButton variant="outline" size="sm" @click="openVariantForm()">+ Add Variant</AppButton>
          </div>

          <div v-if="variants.length" class="tw:space-y-2">
            <div
              v-for="v in variants"
              :key="v.id"
              class="tw:flex tw:items-center tw:justify-between tw:bg-white/4 tw:rounded-xl tw:px-4 tw:py-2.5"
            >
              <div>
                <span class="tw:text-xs tw:text-white/35 tw:uppercase tw:mr-2">{{ v.variantType }}</span>
                <span class="tw:text-sm tw:font-semibold tw:text-cream">{{ v.name }}</span>
                <span v-if="parseFloat(v.priceModifier) !== 0" class="tw:text-xs tw:text-gold tw:ml-2">
                  {{ parseFloat(v.priceModifier) > 0 ? '+' : '' }}₹{{ parseFloat(v.priceModifier).toFixed(0) }}
                </span>
                <span v-if="!v.isActive" class="tw:text-xs tw:text-white/30 tw:ml-2">Inactive</span>
              </div>
              <div class="tw:flex tw:gap-3">
                <button class="tw:text-xs tw:text-gold/70 tw:hover:text-gold" @click="openVariantForm(v)">Edit</button>
                <button class="tw:text-xs tw:text-red-400/60 tw:hover:text-red-400" @click="deleteVariant(v.id)">Remove</button>
              </div>
            </div>
          </div>
          <p v-else class="tw:text-sm tw:text-white/35">No variants yet.</p>
        </div>
      </div>

      <!-- Right: SEO -->
      <div class="tw:space-y-4">
        <div class="tw:bg-white/4 tw:border tw:border-gold/15 tw:rounded-2xl tw:p-5">
          <h2 class="tw:font-semibold tw:text-white/80 tw:mb-4">SEO</h2>
          <div class="tw:space-y-4">
            <FormKit
              v-model="form.metaTitle"
              type="text"
              name="metaTitle"
              label="Meta Title"
              :attrs="{ maxlength: '160' }"
            />
            <FormKit
              v-model="form.metaDescription"
              type="textarea"
              name="metaDescription"
              label="Meta Description"
              :attrs="{ rows: '3', maxlength: '300' }"
            />
          </div>
        </div>

        <div v-if="isNew" class="tw:bg-amber-500/8 tw:border tw:border-amber-500/20 tw:rounded-2xl tw:p-4">
          <p class="tw:text-xs tw:text-amber-400">💡 Save the cake first, then you can upload images and add variants.</p>
        </div>

        <!-- Danger Zone (edit mode only) -->
        <div v-if="!isNew" class="tw:bg-red-500/5 tw:border tw:border-red-500/20 tw:rounded-2xl tw:p-5 tw:space-y-3">
          <h3 class="tw:text-sm tw:font-semibold tw:text-red-400">Danger Zone</h3>
          <p class="tw:text-xs tw:text-white/40 tw:leading-relaxed">
            Permanently delete this cake, all its images (from Cloudinary), variants, reviews and wishlist entries. This cannot be undone.
          </p>

          <!-- Initial button -->
          <div v-if="!showDeleteConfirm">
            <AppButton variant="ghost" size="sm" class="tw:text-red-400! tw:border-red-500/30! tw:hover:bg-red-500/10!" @click="showDeleteConfirm = true">
              Delete Cake
            </AppButton>
          </div>

          <!-- Confirm step -->
          <div v-else class="tw:space-y-3">
            <p class="tw:text-xs tw:text-red-400 tw:font-semibold">Are you sure? This action is irreversible.</p>
            <div class="tw:flex tw:gap-2">
              <AppButton variant="ghost" size="sm" :disabled="deleting" @click="showDeleteConfirm = false">
                Cancel
              </AppButton>
              <AppButton size="sm" class="tw:bg-red-600! tw:border-red-600! tw:text-white! tw:hover:bg-red-700!" :loading="deleting" @click="deleteCake">
                Yes, Delete
              </AppButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Variant modal -->
    <AppModal :open="showVariantForm" :title="editingVariant ? 'Edit Variant' : 'Add Variant'" @close="showVariantForm = false">
      <FormKit
        type="form"
        :actions="false"
        :classes="{ form: 'tw:space-y-4' }"
        @submit="saveVariant"
      >
        <div class="tw:grid tw:grid-cols-2 tw:gap-3">
          <FormKit
            v-model="variantForm.variantType"
            type="select"
            name="variantType"
            label="Type"
            :options="[
              { value: 'size', label: 'Size' },
              { value: 'weight', label: 'Weight' },
              { value: 'flavor', label: 'Flavor' },
              { value: 'tier', label: 'Tier' },
            ]"
          />
          <FormKit
            v-model="variantForm.name"
            type="text"
            name="name"
            label="Name *"
            validation="required"
            :validation-messages="{ required: 'Variant name is required' }"
          />
        </div>

        <div class="tw:grid tw:grid-cols-2 tw:gap-3">
          <FormKit
            v-model="variantForm.priceModifier"
            type="number"
            name="priceModifier"
            label="Price Modifier (₹)"
            :attrs="{ step: '0.01' }"
          />
          <FormKit
            v-model="variantForm.stockQty"
            type="number"
            name="stockQty"
            label="Stock Qty"
            :attrs="{ min: '0' }"
          />
        </div>

        <FormKit
          v-model="variantForm.sku"
          type="text"
          name="sku"
          label="SKU"
        />

        <label class="tw:flex tw:items-center tw:gap-2 tw:cursor-pointer">
          <input v-model="variantForm.isActive" type="checkbox" class="tw:accent-gold" />
          <span class="tw:text-sm tw:text-white/60">Active</span>
        </label>

        <div class="tw:flex tw:gap-3 tw:justify-end">
          <AppButton variant="ghost" type="button" @click="showVariantForm = false">Cancel</AppButton>
          <AppButton variant="gold" type="submit" :loading="savingVariant">Save</AppButton>
        </div>
      </FormKit>
    </AppModal>
  </div>
</template>
