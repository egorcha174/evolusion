<script lang="ts">
  import type { UiEntity } from '$lib/models';

  export let entity: UiEntity;
</script>

<div class="sensor-card" class:warning={entity.severity === 'warning'} class:error={entity.severity === 'error'}>
  <div class="header">
    <h3>{entity.name}</h3>
  </div>

  <div class="content">
    <div class="value-section">
      {#if entity.value !== undefined}
        <span class="value">{entity.value}</span>
        {#if entity.unit}
          <span class="unit">{entity.unit}</span>
        {/if}
      {:else}
        <span class="value">—</span>
      {/if}
    </div>
    <p class="id">{entity.id}</p>
  </div>
</div>

<style>
  .sensor-card {
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #f9f9f9;
    transition: all 0.3s ease;
  }

  .sensor-card.warning {
    border-color: #ffc107;
    background: #fffbf0;
  }

  .sensor-card.error {
    border-color: #dc3545;
    background: #fff5f5;
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

  .value-section {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
    margin-bottom: 0.5rem;
  }

  .value {
    font-size: 1.5rem;
    font-weight: bold;
    color: #333;
  }

  .unit {
    font-size: 0.9rem;
    color: #666;
  }

  .id {
    margin: 0;
    font-size: 0.85rem;
    color: #666;
    word-break: break-all;
  }
</style>
