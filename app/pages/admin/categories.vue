<script setup lang="ts">
import type { Category } from '~/types/api'

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin'] })
useHead({ title: 'Categories – Admin' })

const { showToast } = useAdminToast()

const categories = ref<Category[]>([])
const loading = ref(true)
const showModal = ref(false)
const editingCat = ref<Category | undefined>()

async function fetchCategories() {
  loading.value = true
  try {
    const res = await $fetch<{ success: true; data: Category[] }>('/api/admin/categories', { credentials: 'include' })
    categories.value = res.data
  } finally {
    loading.value = false
  }
}
await fetchCategories()

function openAdd() { editingCat.value = undefined; showModal.value = true }
function openEdit(c: Category) { editingCat.value = c; showModal.value = true }

// Form state
const form = reactive({ name: '', slug: '', description: '', isActive: true, parentId: '' })

watch(showModal, (v) => {
  if (v) {
    form.name = editingCat.value?.name ?? ''
    form.slug = editingCat.value?.slug ?? ''
    form.description = editingCat.value?.description ?? ''
    form.isActive = editingCat.value?.isActive ?? true
    form.parentId = editingCat.value?.parentId ?? ''
  }
})

const submitting = ref(false)
const formError = ref('')

async function submitForm() {
  submitting.value = true
  formError.value = ''
  try {
    const url = editingCat.value ? `/api/admin/categories/${editingCat.value.id}` : '/api/admin/categories'
    const method = editingCat.value ? 'PUT' : 'POST'
    await $fetch(url, { method, credentials: 'include', body: form })
    showModal.value = false
    showToast(editingCat.value ? 'Category updated.' : 'Category created.')
    await fetchCategories()
  } catch (e: any) {
    formError.value = e?.data?.error ?? 'Failed to save.'
  } finally {
    submitting.value = false
  }
}

async function deleteCategory(id: string) {
  if (!confirm('Delete this category? This will fail if any cakes are using it.')) return
  try {
    await $fetch(`/api/admin/categories/${id}`, { method: 'DELETE', credentials: 'include' })
    showToast('Category deleted.')
    await fetchCategories()
  } catch (e: any) {
    showToast(e?.data?.error ?? 'Could not delete.', 'error')
  }
}
</script>

<template>
  <div>
    <div class="tw:flex tw:items-center tw:justify-between tw:mb-8">
      <h1 class="tw:font-playfair tw:text-2xl tw:text-gold-light">Categories</h1>
      <AppButton variant="gold" size="sm" @click="openAdd">+ New Category</AppButton>
    </div>

    <div class="tw:bg-white/4 tw:border tw:border-gold/15 tw:rounded-2xl tw:p-5">
      <AdminDataTable
        :columns="[
          { key: 'name', label: 'Name' },
          { key: 'slug', label: 'Slug' },
          { key: 'status', label: 'Status' },
          { key: 'actions', label: '' },
        ]"
        :loading="loading"
      >
        <tr v-for="cat in categories" :key="cat.id" class="tw:border-b tw:border-white/5">
          <td class="tw:py-3 tw:px-4 tw:font-semibold tw:text-cream tw:text-sm">{{ cat.name }}</td>
          <td class="tw:py-3 tw:px-4 tw:text-white/45 tw:text-sm tw:font-mono">{{ cat.slug }}</td>
          <td class="tw:py-3 tw:px-4">
            <span :class="cat.isActive ? 'tw:text-emerald-400 tw:text-xs' : 'tw:text-white/35 tw:text-xs'">
              {{ cat.isActive ? '● Active' : '○ Inactive' }}
            </span>
          </td>
          <td class="tw:py-3 tw:px-4">
            <div class="tw:flex tw:gap-3 tw:justify-end">
              <button class="tw:text-xs tw:text-gold/70 tw:hover:text-gold" @click="openEdit(cat)">Edit</button>
              <button class="tw:text-xs tw:text-red-400/60 tw:hover:text-red-400" @click="deleteCategory(cat.id)">Delete</button>
            </div>
          </td>
        </tr>
      </AdminDataTable>
    </div>

    <AppModal :open="showModal" :title="editingCat ? 'Edit Category' : 'New Category'" @close="showModal = false">
      <FormKit
        type="form"
        :actions="false"
        :classes="{ form: 'tw:space-y-4' }"
        @submit="submitForm"
      >
        <FormKit
          v-model="form.name"
          type="text"
          name="name"
          label="Name *"
          validation="required"
          :validation-messages="{ required: 'Category name is required' }"
        />
        <FormKit
          v-model="form.slug"
          type="text"
          name="slug"
          label="Slug"
          placeholder="auto-generated if empty"
        />
        <FormKit
          v-model="form.description"
          type="textarea"
          name="description"
          label="Description"
          :attrs="{ rows: '2' }"
        />
        <FormKit
          v-model="form.parentId"
          type="select"
          name="parentId"
          label="Parent Category"
          :options="[
            { value: '', label: 'None (top level)' },
            ...categories
              .filter(c => c.id !== editingCat?.id)
              .map(c => ({ value: c.id, label: c.name })),
          ]"
        />
        <label class="tw:flex tw:items-center tw:gap-2 tw:cursor-pointer">
          <input v-model="form.isActive" type="checkbox" class="tw:accent-gold" />
          <span class="tw:text-sm tw:text-white/60">Active</span>
        </label>
        <p v-if="formError" class="tw:text-red-400 tw:text-sm">{{ formError }}</p>
        <div class="tw:flex tw:gap-3 tw:justify-end">
          <AppButton variant="ghost" type="button" @click="showModal = false">Cancel</AppButton>
          <AppButton variant="gold" type="submit" :loading="submitting">{{ editingCat ? 'Save' : 'Create' }}</AppButton>
        </div>
      </FormKit>
    </AppModal>
  </div>
</template>
