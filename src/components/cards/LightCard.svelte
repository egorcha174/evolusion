<script lang="ts">
  import type { UiEntity } from '../../../lib/models';
  import { activeClient } from '$lib/stores/servers';

  export let entity: UiEntity;
  let loading = false;

  async function handleToggle() {
    if (!$activeClient) return;
    loading = true;
    try {
      const action = entity.actions.find((a) => a.id === 'toggle');
      if (action) {
        const [domain, service] = action.service.split('.');
        await $activeClient.callService(domain, service, action.serviceData || { entity_id: entity.id });
      }
    } catch (err) {
      console.error('Error toggling light:', err);
    } finally {
      loading = false;
    }
  }

  async function handleBrightnessChange(e: Event) {
    if (!$activeClient) return;
    const brightness = parseInt((e.target as HTMLInputElement).value);
    try {
      const brightnessValue = Math.round((brightness / 100) * 255);
      await $activeClient.callService('light', 'turn_on', {
        entity_id: entity.id,
        brightness: brightnessValue
      });
    } catch (err) {
      console.error('Error changing brightness:', err);
    }
  }
</script>

<div class="light-card" class:off={entity.state === 'off'} class:unavailable={entity.isUnavailable}>
  <div class="header">
    <h3>{entity.name}</h3>
    <span class="state">{entity.state}</span>
  </div>

  {#if entity.state === 'on' && entity.brightness !== undefined}
    <div class="brightness-control">
      <label>Яркость: {entity.brightness}%</label>
      <input
        type="range"
        min="0"
        max="100"
        value={entity.brightness}
        on:change={handleBrightnessChange}
        disabled={loading}
      />
    </div>
  {/if}

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
  .light-card {
    padding: 1rem;
    border-radius: 8px;
    background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
    color: white;
  }

  .light-card.off {
    background: linear-gradient(135deg, #434343 0%, #000000 100%);
  }

  .light-card.unavailable {
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

  .brightness-control {
    margin-bottom: 1rem;
  }

  .brightness-control label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  .brightness-control input {
    width: 100%;
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
