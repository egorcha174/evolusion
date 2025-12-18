<script lang="ts">
  import { servers, serverActions, activeServerId } from '$lib/stores/servers';
  import type { HAServerConfig } from '$lib/types/ha';
  
  let showAddForm = false;
  let newServer: Partial<HAServerConfig> = { name: '', url: '', token: '', enabled: true };
  
  function addServer() {
    if (newServer.name && newServer.url && newServer.token) {
      serverActions.add({ id: crypto.randomUUID(), ...newServer as HAServerConfig });
      newServer = { name: '', url: '', token: '', enabled: true };
      showAddForm = false;
    }
  }
</script>

<div class="server-list">
  <div class="header">
    <h2>Home Assistant Servers</h2>
    <button on:click={() => showAddForm = !showAddForm}>
      {showAddForm ? 'Cancel' : 'Add Server'}
    </button>
  </div>
  
  {#if showAddForm}
    <div class="add-form">
      <input bind:value={newServer.name} placeholder="Server Name" />
      <input bind:value={newServer.url} placeholder="http://homeassistant.local:8123" />
      <input bind:value={newServer.token} placeholder="Access token" type="password" />
      <button on:click={addServer}>Save</button>
    </div>
  {/if}
  
  <div class="servers">
    {#each $servers as server (server.id)}
      <div class="server-item" class:active={$activeServerId === server.id}>
        <div class="info">
          <h3>{server.name}</h3>
          <p>{server.url}</p>
        </div>
        <div class="actions">
          <button on:click={() => serverActions.setActive(server.id)}>
            {$activeServerId === server.id ? 'Active' : 'Connect'}
          </button>
          <button on:click={() => serverActions.remove(server.id)}>Remove</button>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .server-list { padding: 1rem; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
  .add-form { display: flex; flex-direction: column; gap: 0.5rem; padding: 1rem; background: #f5f5f5; border-radius: 8px; margin-bottom: 1rem; }
  .servers { display: flex; flex-direction: column; gap: 0.5rem; }
  .server-item { display: flex; justify-content: space-between; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  .server-item.active { border-color: #4caf50; background: #e8f5e9; }
  .actions { display: flex; gap: 0.5rem; }
  button { padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; background: #2196f3; color: white; }
  button:hover { background: #1976d2; }
  input { padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; }
</style>
