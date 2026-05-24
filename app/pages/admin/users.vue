<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth', 'admin'] })
useHead({ title: 'Users – Admin' })

const { showToast } = useAdminToast()

const search = ref('')
const page = ref(1)

const queryParams = computed(() => ({
  limit: 20,
  offset: (page.value - 1) * 20,
  ...(search.value ? { searchField: 'email', searchOperator: 'contains', searchValue: search.value } : {}),
}))

const { data: usersData, pending, refresh } = useFetch<any>('/api/admin/users', {
  query: queryParams,
  credentials: 'include',
  watch: [queryParams],
})

const users = computed(() => usersData.value?.users ?? usersData.value?.data ?? [])
const total = computed(() => usersData.value?.total ?? 0)

// Ban modal
const showBanModal = ref(false)
const banTarget = ref<any>(null)
const banReason = ref('')
const banExpiry = ref('')
const banning = ref(false)

async function openBan(user: any) {
  banTarget.value = user
  banReason.value = ''
  banExpiry.value = ''
  showBanModal.value = true
}

async function submitBan() {
  banning.value = true
  try {
    await $fetch(`/api/admin/users/${banTarget.value.id}/ban`, {
      method: 'POST',
      credentials: 'include',
      body: {
        banReason: banReason.value,
        banExpiresAt: banExpiry.value || undefined,
      },
    })
    showBanModal.value = false
    showToast('User banned.')
    refresh()
  } catch (e: any) {
    showToast(e?.data?.error ?? 'Failed to ban.', 'error')
  } finally {
    banning.value = false
  }
}

async function unban(userId: string) {
  try {
    await $fetch(`/api/admin/users/${userId}/unban`, { method: 'POST', credentials: 'include' })
    showToast('User unbanned.')
    refresh()
  } catch { showToast('Failed to unban.', 'error') }
}

async function setRole(userId: string, role: string) {
  try {
    await $fetch(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      credentials: 'include',
      body: { role },
    })
    showToast(`Role updated to ${role}.`)
    refresh()
  } catch { showToast('Failed to update role.', 'error') }
}
</script>

<template>
  <div>
    <div class="tw:flex tw:items-center tw:justify-between tw:mb-6 tw:flex-wrap tw:gap-3">
      <h1 class="tw:font-playfair tw:text-2xl tw:text-gold-light">Users</h1>
      <div class="tw:flex tw:items-center tw:gap-3">
        <input
          v-model="search"
          placeholder="Search by email..."
          class="tw:bg-white/5 tw:border tw:border-gold/20 tw:rounded-xl tw:px-3 tw:py-2 tw:text-cream tw:text-sm tw:focus:outline-none tw:focus:border-gold/50 tw:w-52"
        />
        <span class="tw:text-xs tw:text-white/35">{{ total }} users</span>
      </div>
    </div>

    <div class="tw:bg-white/4 tw:border tw:border-gold/15 tw:rounded-2xl tw:p-5">
      <AdminDataTable
        :columns="[
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Role' },
          { key: 'status', label: 'Status' },
          { key: 'actions', label: '' },
        ]"
        :loading="pending"
      >
        <tr v-for="user in users" :key="user.id" class="tw:border-b tw:border-white/5">
          <td class="tw:py-3 tw:px-4 tw:font-semibold tw:text-cream tw:text-sm">{{ user.name }}</td>
          <td class="tw:py-3 tw:px-4 tw:text-white/55 tw:text-sm">{{ user.email }}</td>
          <td class="tw:py-3 tw:px-4">
            <span :class="user.role === 'admin' ? 'tw:text-gold tw:text-xs tw:font-semibold' : 'tw:text-white/45 tw:text-xs tw:capitalize'">{{ user.role }}</span>
          </td>
          <td class="tw:py-3 tw:px-4">
            <span v-if="user.banned" class="tw:text-xs tw:text-red-400">Banned</span>
            <span v-else class="tw:text-xs tw:text-emerald-400/70">Active</span>
          </td>
          <td class="tw:py-3 tw:px-4">
            <div class="tw:flex tw:gap-2 tw:justify-end tw:flex-wrap">
              <button
                class="tw:text-xs tw:text-white/40 tw:hover:text-white/60"
                @click="setRole(user.id, user.role === 'admin' ? 'user' : 'admin')"
              >
                {{ user.role === 'admin' ? 'Demote' : 'Make Admin' }}
              </button>
              <button v-if="!user.banned" class="tw:text-xs tw:text-red-400/60 tw:hover:text-red-400" @click="openBan(user)">Ban</button>
              <button v-else class="tw:text-xs tw:text-emerald-400/60 tw:hover:text-emerald-400" @click="unban(user.id)">Unban</button>
            </div>
          </td>
        </tr>
      </AdminDataTable>
    </div>

    <!-- Ban modal -->
    <AppModal :open="showBanModal" title="Ban User" @close="showBanModal = false">
      <div class="tw:space-y-4">
        <p class="tw:text-sm tw:text-white/60">Banning <span class="tw:text-cream tw:font-semibold">{{ banTarget?.email }}</span></p>
        <div>
          <label class="tw:block tw:text-xs tw:text-white/40 tw:mb-1">Reason *</label>
          <input v-model="banReason" required class="tw:w-full tw:bg-white/5 tw:border tw:border-gold/20 tw:rounded-xl tw:px-3 tw:py-2.5 tw:text-cream tw:text-sm tw:focus:outline-none tw:focus:border-gold/50" />
        </div>
        <div>
          <label class="tw:block tw:text-xs tw:text-white/40 tw:mb-1">Ban Expires (optional)</label>
          <input v-model="banExpiry" type="datetime-local" class="tw:bg-white/5 tw:border tw:border-gold/20 tw:rounded-xl tw:px-3 tw:py-2.5 tw:text-cream tw:text-sm tw:focus:outline-none tw:focus:border-gold/50" />
        </div>
        <div class="tw:flex tw:gap-3 tw:justify-end">
          <AppButton variant="ghost" @click="showBanModal = false">Cancel</AppButton>
          <AppButton variant="danger" :loading="banning" @click="submitBan">Ban User</AppButton>
        </div>
      </div>
    </AppModal>
  </div>
</template>
