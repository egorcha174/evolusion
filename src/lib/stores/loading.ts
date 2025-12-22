import { writable, get } from 'svelte/store';

export type LoadingKey = 'entities' | 'servers' | string;

type LoadingState = Record<LoadingKey, boolean>;

// Глобальный стор загрузок
export const loadingStore = writable<LoadingState>({});

// Объект для управления загрузкой
export const isLoading = {
  start: (key: LoadingKey = 'global') => {
    loadingStore.update(state => ({ ...state, [key]: true }));
  },
  stop: (key: LoadingKey = 'global') => {
    loadingStore.update(state => ({ ...state, [key]: false }));
  },
  get: (key: LoadingKey = 'global'): boolean => {
    return get(loadingStore)[key] ?? false;
  }
};

// Деривед стора для глобальной загрузки
export const globalLoading = writable(false);
