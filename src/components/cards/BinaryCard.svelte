<script lang="ts">
  import type { UiEntity } from '$lib/models';
  import { activeClient } from '$lib/stores/servers';

  export let entity: UiEntity;
  let loading = false;

  async function handleToggle() {
    if (!$activeClient || !entity.supportsToggle) return;
    loading = true;
    try {
      const action = entity.actions.find(a => a.id === 'toggle');
      if (action) {
const [domain, service] = action.service.split('.');
        await $activeClient.callService(domain, service, action.serviceData || { entity_id: entity.id });      }
    } catch (err) {
      console.error('Error toggling:', err);
    } finally {
      loading = false;
    }
  }
</script>

<div class="binary-card" class:off={entity.state === 'off'} class:unavailable={entity.isUnavailable}>
  <div class="header">
    <h3>{entity.name}</h3>
    <span class="state">{entity.state}</span>
  </div>
  
  <div class="content">
    <p class="id">{entity.id}</p>
  </div>

  {#if entity.supportsToggle}
    <button 
      on:click={handleToggle} 
      disabled={loading || entity.isUnavailable}
      class="toggle-btn"
    >
      {loading ? 'Loading...' : 'Toggle'}
    </button>
  {/if}
</div>

<style>
  .binary-card {
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #f9f9f9;
    transition: all 0.3s ease;
  }

  .binary-card.off {
    background: #f0f0f0;
    border-color: #bbb;
  }

  .binary-card.unavailable {
    opacity: 0.5;
    background: #eee;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  h3 {
    margin: 0;
    font-size: 1rem;
  }

  .state {
    font-weight: bold;
    font-size: 0.9rem;
    padding: 0.25rem 0.5rem;
    background: #007bff;
    color: white;
    border-radius: 4px;
  }

  .content {
    margin: 0.5rem 0;
  }

  .id {
    margin: 0;
    font-size: 0.85rem;
    color: #666;
    word-break: break-all;
  }

  .toggle-btn {
    width: 100%;
    padding: 0.5rem;
    margin-top: 0.5rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.2s;
  }

  .toggle-btn:hover:not(:disabled) {
    background: #0056b3;
  }

  .toggle-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
