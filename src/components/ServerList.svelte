<script lang="ts">
  import { servers, activeServerId, serverConnectionStatus } from '../lib/stores/servers';
  import type { HAServerConfig } from '../lib/types/ha';

  let newServerUrl = '';
  let newServerToken = '';
  let newServerName = '';

  function selectServer(id: string) {
    activeServerId.set(id);
  }

  function addServer() {
    const trimmedUrl = newServerUrl.trim();
    const trimmedToken = newServerToken.trim();
    const trimmedName = newServerName.trim() || 'Home Assistant';

    if (!trimmedUrl || !trimmedToken) return;

    const server: HAServerConfig = {
      id: crypto.randomUUID(),
      name: trimmedName,
      url: trimmedUrl,
      token: trimmedToken,
      enabled: true
    };

    servers.update((list) => [...list, server]);

    newServerUrl = '';
    newServerToken = '';
    newServerName = '';
  }

  function removeServer(id: string) {
    servers.update((list) => list.filter((s) => s.id !== id));
    activeServerId.update((current) => {
      return current === id ? null : current;
    });
  }
</script>

<section class="server-list">
  <h2 class="title">Серверы Home Assistant</h2>

  <div class="add-form">
    <input
      class="input"
      type="text"
      placeholder="URL сервера (http://homeassistant.local:8123)"
      bind:value={newServerUrl}
    />
    <input
      class="input"
      type="text"
      placeholder="Токен доступа"
      bind:value={newServerToken}
    />
    <input
      class="input"
      type="text"
      placeholder="Название (необязательно)"
      bind:value={newServerName}
    />
    <button class="button primary" on:click={addServer}>
      Добавить сервер
    </button>
  </div>

  {#if $servers.length === 0}
    <p class="empty">Пока нет ни одного сервера. Добавьте первый сервер выше.</p>
  {:else}
    <ul class="list">
      {#each $servers as server}
        {#key server.id}
          <li
            class:selected={server.id === $activeServerId}
            class="item"
            on:click={() => selectServer(server.id)}
          >
            <div class="item-main">
              <div class="name">{server.name}</div>
              <div class="url">{server.url}</div>
            </div>

            <div class="item-meta">
              {#if $serverConnectionStatus[server.id]?.status === 'pending'}
                <span class="status pending">Подключение...</span>
              {:else if $serverConnectionStatus[server.id]?.status === 'ok'}
                <span class="status ok">Онлайн</span>
              {:else if $serverConnectionStatus[server.id]?.status === 'error'}
                <span class="status error">
                  Ошибка: {$serverConnectionStatus[server.id]?.message || 'подключение не удалось'}
                </span>
              {:else}
                <span class="status unknown">Неизвестно</span>
              {/if}

              <button
                class="button danger small"
                type="button"
                on:click|stopPropagation={() => removeServer(server.id)}
              >
                Удалить
              </button>
            </div>
          </li>
        {/key}
      {/each}
    </ul>
  {/if}
</section>

<style>
  .server-list {
    padding: 1rem;
    border-radius: 0.5rem;
    background: #f5f5f5;
    margin-bottom: 1.5rem;
  }

  .title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }

  .add-form {
    display: grid;
    grid-template-columns: 2fr 2fr 1.5fr auto;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .input {
    padding: 0.4rem 0.6rem;
    border-radius: 0.25rem;
    border: 1px solid #ccc;
    font-size: 0.9rem;
  }

  .button {
    border: none;
    border-radius: 0.25rem;
    padding: 0.4rem 0.8rem;
    cursor: pointer;
    font-size: 0.85rem;
    white-space: nowrap;
  }

  .button.primary {
    background-color: #2563eb;
    color: white;
  }

  .button.danger {
    background-color: #dc2626;
    color: white;
  }

  .button.small {
    padding: 0.25rem 0.6rem;
    font-size: 0.8rem;
  }

  .list {
    list-style: none;
    padding: 0;
    margin: 0;
    border-top: 1px solid #e5e7eb;
  }

  .item {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.6rem 0;
    border-bottom: 1px solid #e5e7eb;
    align-items: center;
    cursor: pointer;
  }

  .item.selected {
    background: #e0ecff;
  }

  .item-main {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .name {
    font-weight: 500;
  }

  .url {
    font-size: 0.8rem;
    color: #6b7280;
  }

  .item-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .status {
    font-size: 0.8rem;
    padding: 0.1rem 0.4rem;
    border-radius: 999px;
  }

  .status.ok {
    background: #dcfce7;
    color: #166534;
  }

  .status.pending {
    background: #fef9c3;
    color: #854d0e;
  }

  .status.error {
    background: #fee2e2;
    color: #b91c1c;
  }

  .status.unknown {
    background: #e5e7eb;
    color: #374151;
  }

  .empty {
    font-size: 0.9rem;
    color: #6b7280;
  }

  @media (max-width: 768px) {
    .add-form {
      grid-template-columns: 1fr;
    }

    .item {
      flex-direction: column;
      align-items: flex-start;
    }

    .item-meta {
      width: 100%;
      justify-content: space-between;
    }
  }
</style>
<task_progress>
- [x] Analyze current server store implementation
- [x] Check how connections are currently stored
- [x] Implement persisted store for servers
- [x] Implement persisted store for current connection
- [x] Update the code to use new persisted stores
- [x] Test the implementation
