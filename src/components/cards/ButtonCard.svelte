<script lang="ts">
  import type { UiEntity } from '../../../lib/models';
  import { activeClient } from '$lib/stores/servers';

  export let entity: UiEntity;
  let loading = false;

  async function handleAction() {
    if (!$activeClient || !entity.actions || entity.actions.length === 0) return;
    loading = true;
    try {
      const action = entity.actions[0];
      const [domain, service] = action.service.split('.');
      await $activeClient.callService(domain, service, action.serviceData || { entity_id: entity.id });
    } catch (err) {
      console.error('Error executing action:', err);
    } finally {
      loading = false;
    }
  }
</script>

<div class="button-card" class:unavailable={entity.isUnavailable}>
  <button
    class="action-button"
    on:click={handleAction}
    disabled={loading || entity.isUnavailable}
  >
    {#if loading}
      <span class="spinner">⟳</span>
    {:else}
      {entity.name}
    {/if}
  </button>
</div>

<style>
  .button-card {
    padding: 0.5rem;
  }

  .button-card.unavailable {
    opacity: 0.5;
  }

  .action-button {
    width: 100%;
    padding: 1rem;
    border: none;
    border-radius: 6px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-weight: bold;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .action-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .action-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spinner {
    display: inline-block;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
