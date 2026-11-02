export function useToast() {
  // Publica un evento global con el mensaje y su tipo para que ToastHost lo muestre.
  function showToast(message, type = 'info') {
    window.dispatchEvent(new CustomEvent('juantv:toast', { detail: { message, type } }))
  }
  return { showToast }
}
