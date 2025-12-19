import { writable } from 'svelte/store';

export const loadingStore = writable<Record<string, boolean>>({});

export function withLoading<T>(key: string, promise: Promise<T>): Promise<T> {
  loadingStore.update((state) => ({ ...state, [key]: true }));
  return promise.finally(() => {
    loadingStore.update((state) => ({ ...state, [key]: false }));
  });
}
