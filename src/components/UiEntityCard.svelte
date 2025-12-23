<script lang="ts">
  import type { UiEntity } from '$lib/models';
  export let entity: UiEntity;
</script>

<div class="entity-card">
  <div class="entity-header">
    <div class="entity-icon">
      {#if entity.kind === 'light'}💡{:else if entity.kind === 'switch'}🔌{:else if entity.kind === 'sensor'}📊{:else if entity.kind === 'button'}🔘{:else}🏠{/if}
    </div>
    <div class="entity-info">
      <h3 class="entity-name" title={entity.name}>{entity.name}</h3>
      <p class="entity-id">{entity.id}</p>
    </div>
  </div>

  <div class="entity-content">
    <slot />
  </div>

  <div class="entity-footer">
    <span class="entity-kind">{entity.kind}</span>
    <span class="entity-state" class:active={entity.state === 'on' || entity.state === 'active'}>{entity.state}</span>
  </div>
</div>

<style>
  .entity-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    height: 100%;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .entity-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    border-color: rgba(59, 130, 246, 0.3);
  }

  .entity-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .entity-icon {
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(59, 130, 246, 0.1);
    border-radius: 8px;
    font-size: 1.2rem;
    flex-shrink: 0;
  }

  .entity-info {
    flex: 1;
    overflow: hidden;
  }

  .entity-name {
    font-size: 0.95rem;
    font-weight: 600;
    color: white;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 0.25rem;
  }

  .entity-id {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.5);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: monospace;
  }

  .entity-content {
    flex: 1;
    padding: 0.75rem 0;
    min-height: 60px;
  }

  .entity-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    margin-top: auto;
  }

  .entity-kind {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    font-weight: 500;
    letter-spacing: 0.05em;
  }

  .entity-state {
    font-size: 0.7rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    text-transform: uppercase;
  }

  .entity-state.active {
    background: rgba(59, 130, 246, 0.2);
    color: #3b82f6;
  }
</style>
