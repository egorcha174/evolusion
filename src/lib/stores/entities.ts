import type { UiEntity } from '../models';
import { derived } from 'svelte/store';
import { activeClient } from './servers';
import { mapHaStateToUiEntity } from '../models';

export const uiEntities = derived(activeClient, ($client, set) => {
  if (!$client) {
    set([] as UiEntity[]);
    return;
  }

  const unsubscribe = $client.entities.subscribe((rawEntities) => {
    set(rawEntities.map(mapHaStateToUiEntity));
  });

  return () => {
    unsubscribe();
  };
}, [] as UiEntity[]);
