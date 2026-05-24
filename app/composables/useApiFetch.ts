import type { ApiResponse, PaginatedResponse } from '~/types/api'

/**
 * Wrapper around useFetch that includes credentials and returns Nuxt's reactive refs.
 * Use this for reactive data binding in components/pages.
 */
export function useApiFetch<T>(
  url: string | (() => string),
  opts?: Parameters<typeof useFetch>[1],
) {
  return useFetch<ApiResponse<T> | PaginatedResponse<T>>(url, {
    credentials: 'include',
    ...opts,
  })
}

/**
 * Imperative fetch for actions (POST, PUT, PATCH, DELETE).
 * Unwraps the `{ success, data }` envelope and throws if success is false.
 */
export async function apiFetch<T>(
  url: string,
  opts?: Parameters<typeof $fetch>[1],
): Promise<T> {
  const res = await $fetch<ApiResponse<T>>(url, {
    credentials: 'include',
    ...opts,
  })
  return (res as ApiResponse<T>).data
}
