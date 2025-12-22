<script lang="ts">
  import type { UiEntity } from '$lib/models';
  import { activeClient } from '$lib/stores/servers';

  export let entity: UiEntity;
  let loading = false;

  async function handleToggle() {
    if (!$activeClient || !entity.supportsToggle) return;
    loading = true;
    try {
      const action = entity.actions.find((a) => a.id === 'toggle');
      if (action) {
        const [domain, service] = action.service.split('.');
        await $activeClient.callService(domain, service, action.serviceData || { entity_id: entity.id });
      }
    } catch (err) {
      console.error('Error toggling switch:', err);
    } finally {
      loading = false;
    }
  }
</script>

<div class="switch-card" class:off={entity.state === 'off'} class:unavailable={entity.isUnavailable}>
  <div class="header">
    <h3>{entity.name}</h3>
    <span class="state">{entity.state}</span>
  </div>

  <div class="content">
    <button
      class="toggle-button"
      on:click={handleToggle}
      disabled={loading || entity.isUnavailable}
    >
      {#if loading}
        <span class="spinner">⟳</span>
      {:else}
        {entity.state === 'on' ? '✓ ВКЛ' : 'ВЫКЛ'}
      {/if}
    </button>
  </div>
</div>

<style>
  .switch-card {
    padding: 1rem;
    border-radius: 8px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .switch-card.off {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }

  .switch-card.unavailable {
    opacity: 0.5;
    background: #999;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .header h3 {
    margin: 0;
    font-size: 1.1rem;
  }

  .state {
    font-size: 0.9rem;
    opacity: 0.9;
  }

  .content {
    display: flex;
    gap: 0.5rem;
  }

  .toggle-button {
    flex: 1;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .toggle-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.02);
  }

  .toggle-button:disabled {
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
