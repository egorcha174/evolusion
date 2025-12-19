<script lang="ts">
  import type { UiEntity } from '$lib/models';
  import { activeClient } from '$lib/stores/servers';

  export let entity: UiEntity;
  let loading = false;

  async function handleAction() {
    if (!$activeClient || entity.actions.length === 0) return;
    loading = true;
    try {
      const action = entity.actions[0];
      if (action) {
const [domain, service] = action.service.split('.');
				await $activeClient.callService(domain, service, action.serviceData || {});
			}      }
    } catch (err) {
      console.error('Error executing action:', err);
    } finally {
      loading = false;
    }
  }
</script>

<div class="info-card" class:unavailable={entity.isUnavailable}>
  <div class="header">
    <h3>{entity.name}</h3>
  </div>

  <div class="content">
    <p class="state">{entity.state}</p>
    <p class="id">{entity.id}</p>
  </div>

  {#if entity.actions.length > 0}
    <button 
      on:click={handleAction} 
      disabled={loading || entity.isUnavailable}
      class="action-btn"
    >
      {loading ? 'Loading...' : entity.actions[0].label}
    </button>
  {/if}
</div>

<style>
  .info-card {
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #f9f9f9;
    transition: all 0.3s ease;
  }

  .info-card.unavailable {
    opacity: 0.5;
    background: #eee;
  }

  .header {
    margin-bottom: 0.5rem;
  }

  h3 {
    margin: 0;
    font-size: 1rem;
  }

  .content {
    margin: 0.5rem 0;
  }

  .state {
    margin: 0.25rem 0;
    font-size: 0.95rem;
    font-weight: 500;
    color: #333;
  }

  .id {
    margin: 0.25rem 0;
    font-size: 0.85rem;
    color: #666;
    word-break: break-all;
  }

  .action-btn {
    width: 100%;
    padding: 0.5rem;
    margin-top: 0.5rem;
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.2s;
  }

  .action-btn:hover:not(:disabled) {
    background: #5a6268;
  }

  .action-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
