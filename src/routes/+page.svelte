<script lang="ts">
  import SettingsMenu from '../components/SettingsMenu.svelte';
  import UiEntityCard from '../components/UiEntityCard.svelte';
  import SwitchCard from '../components/cards/SwitchCard.svelte';
  import LightCard from '../components/cards/LightCard.svelte';
  import SensorCard from '../components/cards/SensorCard.svelte';
  import ButtonCard from '../components/cards/ButtonCard.svelte';
  import Sidebar from '../components/Sidebar.svelte';
  import TabSystem from '../components/TabSystem.svelte';
  import GridLayout from '../components/GridLayout.svelte';

  import { activeClient, activeServerId, serverConnectionStatus } from '../lib/stores/servers';
  import { uiEntities } from '../lib/stores/entities';
  import { loadingStore } from '../lib/stores/loading';

  let filterKind: string | null = null;
  let sidebarOpen = true;
  let activeTab = 'Home';

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

  // Фильтрация по вкладкам
  $: tabFilteredEntities = activeTab === 'Home'
    ? allEntities
    : allEntities.filter(e => {
        if (activeTab === 'Living Room') return e.kind === 'light' || e.kind === 'switch';
        if (activeTab === 'Server Rack') return e.kind === 'switch' || e.kind === 'sensor';
        if (activeTab === 'Multimedia') return e.kind === 'button';
        if (activeTab === 'Climate') return e.kind === 'sensor';
        if (activeTab === 'Entities') return true;
        return true;
      });

  // Группировка устройств по комнатам/зонам
  $: groupedEntities = {
    'Living Room': allEntities.filter(e => e.name.toLowerCase().includes('living') || e.kind === 'light'),
    'Kiddo': allEntities.filter(e => e.name.toLowerCase().includes('kid') || e.name.toLowerCase().includes('child')),
    'Bedroom': allEntities.filter(e => e.name.toLowerCase().includes('bed')),
    'Kitchen': allEntities.filter(e => e.name.toLowerCase().includes('kitchen')),
    'Home': allEntities.filter(e => !e.name.toLowerCase().includes('living') && !e.name.toLowerCase().includes('kid') && !e.name.toLowerCase().includes('bed') && !e.name.toLowerCase().includes('kitchen'))
  };

  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }
</script>

<main class="dashboard-layout">
  <Sidebar bind:isOpen={sidebarOpen} bind:activeTab={activeTab} />

  <div class="main-content" class:sidebar-open={sidebarOpen}>
    <div class="header-bar">
      <div class="header-title">Эволюция Dashboard</div>
      <div class="header-actions">
        {#if !$activeClient}
          <div class="server-warning">
            <span class="warning-icon">⚠️</span>
            <span class="warning-text">Сервер не выбран</span>
          </div>
        {:else if status?.status === 'error'}
          <div class="server-error">
            <span class="error-icon">❌</span>
            <span class="error-text">Ошибка подключения</span>
          </div>
        {/if}
        <SettingsMenu bind:sidebarOpen onSidebarToggle={toggleSidebar} />
      </div>
    </div>

    <div class="container">
      {#if !$activeClient}
        <div class="alert alert-warning">
          <p class="font-bold">Сервер не выбран</p>
          <p>Перейдите в меню настроек → Серверы Home Assistant, чтобы добавить сервер.</p>
        </div>
      {:else if status?.status === 'error'}
        <div class="alert alert-error">
          <p class="font-bold">Ошибка подключения</p>
          <p>{status.message || 'Не удалось подключиться к серверу.'}</p>
        </div>
      {:else if isLoading && allEntities.length === 0}
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>Загрузка устройств...</p>
        </div>
      {:else}
        <TabSystem bind:activeTab>
          <div slot="Home">
            {#if tabFilteredEntities.length === 0}
              <p class="empty-state">Нет устройств этого типа.</p>
            {:else}
              <div class="room-sections">
                {#each Object.entries(groupedEntities) as [roomName, roomEntities]}
                  {#if roomEntities.length > 0}
                    <div class="room-section">
                      <h2 class="room-title">{roomName}</h2>
                      <GridLayout columns={3} gap={16}>
                        {#each roomEntities as entity (entity.id)}
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
                      </GridLayout>
                    </div>
                  {/if}
                {/each}
              </div>
            {/if}
          </div>

          <div slot="Living Room">
            {#if tabFilteredEntities.length === 0}
              <p class="empty-state">Нет устройств этого типа.</p>
            {:else}
              <GridLayout columns={3} gap={16}>
                {#each tabFilteredEntities as entity (entity.id)}
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
              </GridLayout>
            {/if}
          </div>

          <div slot="Server Rack">
            {#if tabFilteredEntities.length === 0}
              <p class="empty-state">Нет устройств этого типа.</p>
            {:else}
              <GridLayout columns={3} gap={16}>
                {#each tabFilteredEntities as entity (entity.id)}
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
              </GridLayout>
            {/if}
          </div>

          <div slot="Multimedia">
            {#if tabFilteredEntities.length === 0}
              <p class="empty-state">Нет устройств этого типа.</p>
            {:else}
              <GridLayout columns={3} gap={16}>
                {#each tabFilteredEntities as entity (entity.id)}
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
              </GridLayout>
            {/if}
          </div>

          <div slot="Climate">
            {#if tabFilteredEntities.length === 0}
              <p class="empty-state">Нет устройств этого типа.</p>
            {:else}
              <GridLayout columns={3} gap={16}>
                {#each tabFilteredEntities as entity (entity.id)}
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
              </GridLayout>
            {/if}
          </div>

          <div slot="Entities">
            {#if tabFilteredEntities.length === 0}
              <p class="empty-state">Нет устройств этого типа.</p>
            {:else}
              <GridLayout columns={3} gap={16}>
                {#each tabFilteredEntities as entity (entity.id)}
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
              </GridLayout>
            {/if}
          </div>
        </TabSystem>
      {/if}
    </div>
  </div>
</main>

<style>
  .dashboard-layout {
    display: flex;
    min-height: 100vh;
  }

  .main-content {
    margin-left: 320px;
    width: calc(100% - 320px);
    transition: margin-left 0.3s ease, width 0.3s ease;
    background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
    color: white;
    min-height: 100vh;
    padding: 0;
    box-sizing: border-box;
  }

  .main-content:not(.sidebar-open) {
    margin-left: 0;
    width: 100%;
  }

  .container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 1rem;
  }

  .header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
  }

  .header-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: white;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .server-warning, .server-error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .server-warning {
    background: rgba(255, 193, 7, 0.1);
    color: #f59e0b;
  }

  .server-error {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }

  .warning-icon, .error-icon {
    font-size: 1.1rem;
  }

  .alert {
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .alert-warning {
    background: rgba(255, 193, 7, 0.1);
    border-left: 4px solid #f59e0b;
    color: #f59e0b;
  }

  .alert-error {
    background: rgba(239, 68, 68, 0.1);
    border-left: 4px solid #ef4444;
    color: #ef4444;
  }

  .loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 0;
    color: rgba(255, 255, 255, 0.6);
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(255, 255, 255, 0.2);
    border-bottom-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .empty-state {
    text-align: center;
    padding: 2rem;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.9rem;
  }

  .room-sections {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .room-section {
    margin-bottom: 2rem;
  }

  .room-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
  }
</style>
