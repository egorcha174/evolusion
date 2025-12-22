import { writable } from 'svelte/store';

export type LoadingKey = 'entities' | 'servers' | string;

type LoadingState = Record<LoadingKey, boolean>;

// Глобальный стор загрузок
export const loadingStore = writable<LoadingState>({});
