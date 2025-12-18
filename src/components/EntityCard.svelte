<script lang="ts">
  import type { HAEntity } from '$lib/types/ha';
  export let entity: HAEntity;
  function toggleEntity() {
    console.log('Toggle entity:', entity.entity_id);
  }
</script>

<div class="entity-card">
  <div class="header">
    <h3>{entity.attributes.friendly_name || entity.entity_id}</h3>
    <span>{entity.state}</span>
  </div>
  <p>ID: {entity.entity_id}</p>
  <p>Updated: {new Date(entity.last_updated).toLocaleString()}</p>
  {#if entity.entity_id.startsWith('light.') || entity.entity_id.startsWith('switch.')}
    <button on:click={toggleEntity}>Toggle</button>
  {/if}
</div>

<style>
  .entity-card { padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  .header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
  h3 { margin: 0; font-size: 1rem; }
  p { font-size: 0.875rem; margin: 0.25rem 0; }
  button { width: 100%; padding: 0.5rem; border: none; border-radius: 4px; background: #2196f3; color: white; cursor: pointer; }
</style>
