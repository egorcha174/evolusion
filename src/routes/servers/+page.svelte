<script lang="ts">
  import ServerList from '../../components/ServerList.svelte';
  import { activeClient, activeServerId, serverConnectionStatus } from '../../lib/stores/servers';
  import { uiEntities } from '../../lib/stores/entities';
  import { loadingStore } from '../../lib/stores/loading';

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
</script>

<main class="servers-layout">
  <div class="servers-header">
    <h1 class="servers-title">Управление серверами Home Assistant</h1>
    <div class="servers-breadcrumb">
      <a href="/" class="breadcrumb-link">← Назад к дашборду</a>
    </div>
  </div>

  <div class="servers-content">
    <ServerList />
  </div>
</main>

<style>
  .servers-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
    color: white;
    padding: 2rem;
    box-sizing: border-box;
  }

  .servers-header {
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .servers-title {
    font-size: 1.75rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: white;
  }

  .servers-breadcrumb {
    font-size: 0.9rem;
    opacity: 0.8;
  }

  .breadcrumb-link {
    color: #3b82f6;
    text-decoration: none;
    transition: opacity 0.2s ease;
  }

  .breadcrumb-link:hover {
    opacity: 0.7;
  }

  .servers-content {
    flex: 1;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }
</style>
