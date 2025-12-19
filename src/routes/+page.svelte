<script lang="ts">
  import ServerList from '../components/ServerList.svelte';
  import UiEntityCard from '../components/UiEntityCard.svelte';
  import { activeClient } from '$lib/stores/servers';
  import { mapHaStateToUiEntity } from '$lib/models';
  import type { UiEntity } from '$lib/models';

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

<svelte:head>
  <title>Evolusion Dashboard</title>
</svelte:head>

<main>
  <h1>Evolusion - Home Assistant</h1>

  <ServerList />

  <h2>Entities ({filteredEntities.length})</h2>
  {#if $activeClient}
    <!-- Фильтры по типам -->
    <div class="filters">
      <button 
        class:active={filterKind === null}
        on:click={() => filterKind = null}
      >
        All ({uiEntities.length})
      </button>
      {#each Object.entries(kindGroups) as [kind, count]}
        <button
          class:active={filterKind === kind}
          on:click={() => filterKind = kind}
        >
          {kind} ({count})
        </button>
      {/each}
    </div>

    <!-- Сетка карточек -->
    <div class="grid">
      {#each filteredEntities as entity (entity.id)}
        <UiEntityCard {entity} />
      {/each}
    </div>
  {:else}
    <p>Connect to a server</p>
  {/if}
</main>

<style>
  main {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  h1, h2 {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .filters {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }

  .filters button {
    padding: 0.5rem 1rem;
    background: #f0f0f0;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
  }

  .filters button:hover {
    background: #e8e8e8;
  }

  .filters button.active {
    background: #007bff;
    color: white;
    border-color: #007bff;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }
</style>
