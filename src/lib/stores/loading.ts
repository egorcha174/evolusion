// Store для индикаторов загрузки
import { writable } from 'svelte/store';

function createLoadingStore() {
  const { subscribe, set } = writable(false);
  let loadingCounter = 0;

  return {
    subscribe,
    start: () => {
      loadingCounter++;
      set(true);
    },
    stop: () => {
      loadingCounter = Math.max(0, loadingCounter - 1);
      if (loadingCounter === 0) {
        set(false);
      }
    },
    reset: () => {
      loadingCounter = 0;
      set(false);
    }
  };
}

export const isLoading = createLoadingStore();
export const progress = writable<number>(0);
