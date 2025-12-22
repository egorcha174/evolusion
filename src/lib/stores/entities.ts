import type { UiEntity } from '../models';
import { derived } from 'svelte/store';
import { activeClient } from './servers';
import { mapHaStateToUiEntity } from '../models';

export const uiEntities = derived(activeClient, ($client, set) => {
  if (!$client) {
    set([] as UiEntity[]);
    return;
  }

  // Проверяем, есть ли у клиента метод entities.subscribe
  if (typeof $client.entities?.subscribe !== 'function') {
    set([] as UiEntity[]);
    return;
  }

  const unsubscribe = $client.entities.subscribe((rawEntities) => {
    try {
      set(rawEntities.map(mapHaStateToUiEntity));
    } catch (error) {
      console.error('[uiEntities] Error mapping entities:', error);
      set([] as UiEntity[]);
    }
  });

  return () => {
    try {
      unsubscribe();
    } catch (error) {
      console.error('[uiEntities] Error unsubscribing:', error);
    }
  };
}, [] as UiEntity[]);
