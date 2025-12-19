import toast from 'svelte-french-toast';

export function showNotification(
  message: string,
  type: 'success' | 'error' | 'loading' | 'info' = 'info'
) {
  if (type === 'info') {
    toast(message, { position: 'top-right' });
  } else {
    // @ts-ignore
    toast[type](message, {
      position: 'top-right',
      duration: 3000
    });
  }
}
