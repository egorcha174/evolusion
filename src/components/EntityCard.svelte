<script lang="ts">
  import type { HAEntity } from '$lib/types/ha';
  import { activeClient } from '$lib/stores/servers';

  export let entity: HAEntity;

  async function toggleEntity() {
    try {
      if (!$activeClient) {
        console.error('No active client');
        return;
      }

      const service = entity.state === 'on' ? 'turn_off' : 'turn_on';
      const domain = entity.entity_id.split('.')[0];

      await $activeClient.callService(domain, service, {
        entity_id: entity.entity_id
      });

      console.log(`${service} called for ${entity.entity_id}`);
    } catch (error) {
      console.error('Error toggling entity:', error);
    }
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
  .entity-card {
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  h3 {
    margin: 0;
    font-size: 1rem;
  }

  p {
    font-size: 0.875rem;
    margin: 0.25rem 0;
  }

  button {
    width: 100%;
    padding: 0.5rem;
    border: none;
    border-radius: 4px;
    background: #2196f3;
    color: white;
    cursor: pointer;
  }

  button:hover {
    background: #1976d2;
  }
</style>
