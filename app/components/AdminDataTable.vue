<script setup lang="ts">
defineProps<{
  columns: { key: string; label: string; sortable?: boolean }[]
  loading?: boolean
  skeletonRows?: number
}>()
const emit = defineEmits<{ sort: [key: string, dir: 'asc' | 'desc'] }>()

const sortKey = ref('')
const sortDir = ref<'asc' | 'desc'>('asc')

function toggleSort(key: string) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
  emit('sort', sortKey.value, sortDir.value)
}
</script>

<template>
  <div class="tw:overflow-x-auto">
    <table class="tw:w-full tw:text-sm">
      <thead>
        <tr class="tw:border-b tw:border-white/8">
          <th
            v-for="col in columns"
            :key="col.key"
            :class="[
              'tw:text-left tw:py-3 tw:px-4 tw:text-xs tw:uppercase tw:tracking-wider tw:font-semibold tw:text-white/40',
              col.sortable ? 'tw:cursor-pointer tw:hover:text-white/70 tw:select-none tw:transition-colors' : '',
            ]"
            @click="col.sortable && toggleSort(col.key)"
          >
            {{ col.label }}
            <span v-if="col.sortable && sortKey === col.key" class="tw:ml-1">
              {{ sortDir === 'asc' ? '↑' : '↓' }}
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <!-- Skeleton rows -->
        <template v-if="loading">
          <tr v-for="i in (skeletonRows ?? 5)" :key="i" class="tw:border-b tw:border-white/5">
            <td v-for="col in columns" :key="col.key" class="tw:py-3 tw:px-4">
              <div class="tw:h-4 tw:bg-white/8 tw:rounded tw:animate-pulse tw:w-3/4" />
            </td>
          </tr>
        </template>

        <!-- Actual rows -->
        <template v-else>
          <slot />
        </template>
      </tbody>
    </table>
  </div>
</template>
