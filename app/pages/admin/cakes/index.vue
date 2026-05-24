<script setup lang="ts">
import type { Category } from '~/types/api'

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin'] })
useHead({ title: 'Cakes – Admin' })

const { showToast } = useAdminToast()
const router = useRouter()
const page = ref(1)
const searchQ = ref('')
const categoryFilter = ref('')
const statusFilter = ref('')

const queryParams = computed(() => ({
  page: page.value,
  limit: 20,
  ...(searchQ.value ? { search: searchQ.value } : {}),
  ...(categoryFilter.value ? { category: categoryFilter.value } : {}),
  ...(statusFilter.value !== '' ? { isActive: statusFilter.value } : {}),
}))

const { data: cakesData, pending, refresh } = useFetch<any>('/api/admin/cakes', {
  query: queryParams,
  credentials: 'include',
  watch: [queryParams],
})

const { data: catData } = await useFetch<any>('/api/admin/categories', { credentials: 'include' })
const categories = computed<Category[]>(() => catData.value?.data ?? [])

const cakes = computed(() => cakesData.value?.data ?? [])
const meta = computed(() => cakesData.value?.meta)

async function toggleActive(id: string, current: boolean) {
  try {
    await $fetch(`/api/admin/cakes/${id}`, {
      method: 'PUT',
      credentials: 'include',
      body: { isActive: !current },
    })
    showToast(`Cake ${current ? 'deactivated' : 'activated'}.`)
    refresh()
  } catch { showToast('Failed to update.', 'error') }
}

const confirmDeleteId = ref<string | null>(null)
const deleting = ref(false)

async function deleteCake(id: string) {
  deleting.value = true
  try {
    await $fetch(`/api/admin/cakes/${id}`, { method: 'DELETE', credentials: 'include' })
    showToast('Cake permanently deleted.')
    confirmDeleteId.value = null
    refresh()
  } catch { showToast('Failed to delete.', 'error') }
  finally { deleting.value = false }
}
</script>

<template>
  <div>
    <div class="tw:flex tw:items-center tw:justify-between tw:mb-6 tw:flex-wrap tw:gap-3">
      <h1 class="tw:font-playfair tw:text-2xl tw:text-gold-light">Cakes</h1>
      <AppButton variant="gold" size="sm" @click="router.push('/admin/cakes/new')">+ New Cake</AppButton>
    </div>

    <!-- Filters -->
    <div class="tw:flex tw:flex-wrap tw:gap-3 tw:mb-6">
      <input
        v-model="searchQ"
        placeholder="Search cakes..."
        class="tw:bg-white/5 tw:border tw:border-gold/20 tw:rounded-xl tw:px-3 tw:py-2 tw:text-cream tw:text-sm tw:focus:outline-none tw:focus:border-gold/50 tw:w-48"
        @input="page = 1"
      />
      <select v-model="categoryFilter" class="tw:bg-white/5 tw:border tw:border-gold/20 tw:rounded-xl tw:px-3 tw:py-2 tw:text-cream tw:text-sm tw:focus:outline-none" @change="page = 1">
        <option value="">All Categories</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.slug">{{ cat.name }}</option>
      </select>
      <select v-model="statusFilter" class="tw:bg-white/5 tw:border tw:border-gold/20 tw:rounded-xl tw:px-3 tw:py-2 tw:text-cream tw:text-sm tw:focus:outline-none" @change="page = 1">
        <option value="">All Statuses</option>
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </select>
    </div>

    <div class="tw:bg-white/4 tw:border tw:border-gold/15 tw:rounded-2xl tw:p-5">
      <AdminDataTable
        :columns="[
          { key: 'name', label: 'Name' },
          { key: 'category', label: 'Category' },
          { key: 'price', label: 'Base Price' },
          { key: 'status', label: 'Status' },
          { key: 'actions', label: '' },
        ]"
        :loading="pending"
      >
        <tr v-for="cake in cakes" :key="cake.id" class="tw:border-b tw:border-white/5">
          <td class="tw:py-3 tw:px-4">
            <div class="tw:flex tw:items-center tw:gap-3">
              <div class="tw:w-9 tw:h-9 tw:rounded-lg tw:overflow-hidden tw:bg-navy tw:shrink-0">
                <img v-if="cake.primaryImageUrl" :src="cake.primaryImageUrl" :alt="cake.name" class="tw:w-full tw:h-full tw:object-cover" />
                <div v-else class="tw:w-full tw:h-full tw:flex tw:items-center tw:justify-center tw:text-sm">🎂</div>
              </div>
              <span class="tw:font-semibold tw:text-cream tw:text-sm">{{ cake.name }}</span>
            </div>
          </td>
          <td class="tw:py-3 tw:px-4 tw:text-white/45 tw:text-sm">{{ cake.category?.name ?? '—' }}</td>
          <td class="tw:py-3 tw:px-4 tw:text-gold tw:font-semibold tw:text-sm">₹{{ parseFloat(cake.basePrice).toFixed(0) }}</td>
          <td class="tw:py-3 tw:px-4">
            <span :class="cake.isActive ? 'tw:text-emerald-400 tw:text-xs' : 'tw:text-white/30 tw:text-xs'">
              {{ cake.isActive ? '● Active' : '○ Inactive' }}
            </span>
          </td>
          <td class="tw:py-3 tw:px-4">
            <div class="tw:flex tw:gap-3 tw:justify-end tw:items-center">
              <button class="tw:text-xs tw:text-gold/70 tw:hover:text-gold" @click="router.push(`/admin/cakes/${cake.id}`)">Edit</button>
              <button
                :class="cake.isActive ? 'tw:text-white/35 tw:hover:text-amber-400' : 'tw:text-emerald-400/60 tw:hover:text-emerald-400'"
                class="tw:text-xs"
                @click="toggleActive(cake.id, cake.isActive)"
              >
                {{ cake.isActive ? 'Deactivate' : 'Activate' }}
              </button>

              <!-- Delete: first click shows confirm, second click deletes -->
              <template v-if="confirmDeleteId === cake.id">
                <span class="tw:text-xs tw:text-white/40">Sure?</span>
                <button
                  class="tw:text-xs tw:text-red-400 tw:font-semibold"
                  :disabled="deleting"
                  @click="deleteCake(cake.id)"
                >
                  {{ deleting ? '…' : 'Yes, delete' }}
                </button>
                <button class="tw:text-xs tw:text-white/35 tw:hover:text-white/60" @click="confirmDeleteId = null">Cancel</button>
              </template>
              <button
                v-else
                class="tw:text-xs tw:text-red-400/50 tw:hover:text-red-400"
                @click="confirmDeleteId = cake.id"
              >
                Delete
              </button>
            </div>
          </td>
        </tr>
      </AdminDataTable>
    </div>

    <AppPagination v-if="meta" :meta="meta" @change="page = $event" />
  </div>
</template>
