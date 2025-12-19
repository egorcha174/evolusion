<script lang="ts">
  import ServerList from '../components/ServerList.svelte';
  import UiEntityCard from '../components/UiEntityCard.svelte';
  import SwitchCard from '../components/cards/SwitchCard.svelte';
  import LightCard from '../components/cards/LightCard.svelte';
  import SensorCard from '../components/cards/SensorCard.svelte';
  import ButtonCard from '../components/cards/ButtonCard.svelte';
  import { activeClient } from '../lib/stores/servers';
  import { mapHaStateToUiEntity } from '../lib/models';
  import type { UiEntity } from '../lib/models';

  let uiEntities: UiEntity[] = [];
  let filterKind: string | null = null;

  // Подписываемся на сырые entities из HA и нормализуем их
  $: if ($activeClient) {
    const unsubscribe = $activeClient.entities.subscribe((rawEntities) => {
      uiEntities = rawEntities.map(mapHaStateToUiEntity);
    });
  }

  // Фильтруем по типу (kind)
  $: filteredEntities = filterKind
    ? uiEntities.filter((e) => e.kind === filterKind)
    : uiEntities;

  // Группируем по kind для статистики
  $: kindGroups = uiEntities.reduce(
    (acc, e) => {
      if (!acc[e.kind]) acc[e.kind] = 0;
      acc[e.kind]++;
      return acc;
    },
    {} as Record<string, number>
  );
</script>

<main>
  <ServerList />

  <div class="container mt-8">
    <h1 class="text-3xl font-bold mb-6">Эволюция Dashboard</h1>

    <!-- Кнопки фильтра по типам -->
    <div class="mb-6 flex gap-2 flex-wrap">
      <button
        class="px-4 py-2 rounded"
        class:bg-blue-500={filterKind === null}
        class:text-white={filterKind === null}
        class:bg-gray-200={filterKind !== null}
        on:click={() => (filterKind = null)}
      >
        Все ({uiEntities.length})
      </button>
      {#each Object.entries(kindGroups) as [kind, count]}
        <button
          class="px-4 py-2 rounded capitalize"
          class:bg-blue-500={filterKind === kind}
          class:text-white={filterKind === kind}
          class:bg-gray-200={filterKind !== kind}
          on:click={() => (filterKind = kind)}
        >
          {kind} ({count})
        </button>
      {/each}
    </div>

    <!-- Грид карток -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each filteredEntities as entity (entity.id)}
        <UiEntityCard {entity}>
          {#if entity.kind === 'switch'}
            <SwitchCard {entity} />
          {:else if entity.kind === 'light'}
            <LightCard {entity} />
          {:else if entity.kind === 'sensor'}
            <SensorCard {entity} />
          {:else if entity.kind === 'button'}
            <ButtonCard {entity} />
          {/if}
        </UiEntityCard>
      {/each}
    </div>
  </div>
</main>

<style>
  main {
    padding: 1rem;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
</style>
