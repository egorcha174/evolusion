
<script lang="ts">
  import ServerList from '../components/ServerList.svelte';
  import UiEntityCard from '../components/UiEntityCard.svelte';
  import SwitchCard from '../components/cards/SwitchCard.svelte';
  import LightCard from '../components/cards/LightCard.svelte';
  import SensorCard from '../components/cards/SensorCard.svelte';
  import ButtonCard from '../components/cards/ButtonCard.svelte';

  import { activeClient, activeServerId, serverConnectionStatus } from '../lib/stores/servers';
  import { uiEntities } from '../lib/stores/entities';
  import { loadingStore } from '../lib/stores/loading';

  let filterKind: string | null = null;

  // Статус подключения (или null)
  $: status =
    $activeServerId && $serverConnectionStatus
      ? $serverConnectionStatus[$activeServerId] ?? null
      : null;

  // Безопасное чтение флага загрузки сущностей
  $: entitiesLoading =
    ($loadingStore && ($loadingStore.entities ?? $loadingStore['entities'])) === true;

  $: isLoading = entitiesLoading || status?.status === 'pending';

  // Массив сущностей по умолчанию пустой
  $: allEntities = Array.isArray($uiEntities) ? $uiEntities : [];

  // Фильтрация по типу (kind)
  $: filteredEntities = filterKind
    ? allEntities.filter((e) => e.kind === filterKind)
    : allEntities;

  // Группировка по kind для статистики
  $: kindGroups = allEntities.reduce(
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

    {#if !$activeClient}
      <div
        class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6"
        role="alert"
      >
        <p class="font-bold">Сервер не выбран</p>
        <p>Выберите сервер Home Assistant в списке выше, чтобы увидеть устройства.</p>
      </div>
    {:else if status?.status === 'error'}
      <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
        <p class="font-bold">Ошибка подключения</p>
        <p>{status.message || 'Не удалось подключиться к серверу.'}</p>
      </div>
    {:else if isLoading && allEntities.length === 0}
      <div class="flex flex-col items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p class="text-gray-500">Загрузка устройств...</p>
      </div>
    {:else}
      <!-- Кнопки фильтра по типам -->
      <div class="mb-6 flex gap-2 flex-wrap">
        <button
          class="px-4 py-2 rounded"
          class:bg-blue-500={filterKind === null}
          class:text-white={filterKind === null}
          class:bg-gray-200={filterKind !== null}
          on:click={() => (filterKind = null)}
        >
          Все ({allEntities.length})
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

      {#if filteredEntities.length === 0}
        <p class="text-gray-500 text-center py-8">Нет устройств этого типа.</p>
      {:else}
        <!-- Грид карточек -->
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
      {/if}
    {/if}
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
