export function useHomeToast() {
  const toastMessage = useState('home-toast-message', () => '')
  const toastVisible = useState('home-toast-visible', () => false)

  let hideTimer: ReturnType<typeof setTimeout> | undefined

  function showToast(message: string, durationMs = 3000) {
    toastMessage.value = message
    toastVisible.value = true

    if (hideTimer) {
      clearTimeout(hideTimer)
    }

    hideTimer = setTimeout(() => {
      toastVisible.value = false
    }, durationMs)
  }

  return {
    toastMessage: readonly(toastMessage),
    toastVisible: readonly(toastVisible),
    showToast,
  }
}
