export type AdminToastType = 'success' | 'error'

export function useAdminToast() {
  const toastMessage = useState('admin-toast-message', () => '')
  const toastVisible = useState('admin-toast-visible', () => false)
  const toastType = useState<AdminToastType>('admin-toast-type', () => 'success')

  let hideTimer: ReturnType<typeof setTimeout> | undefined

  function showToast(message: string, type: AdminToastType = 'success', durationMs = 3500) {
    toastMessage.value = message
    toastType.value = type
    toastVisible.value = true
    if (hideTimer) clearTimeout(hideTimer)
    hideTimer = setTimeout(() => {
      toastVisible.value = false
    }, durationMs)
  }

  return {
    toastMessage: readonly(toastMessage),
    toastVisible: readonly(toastVisible),
    toastType: readonly(toastType),
    showToast,
  }
}
