<script lang="ts">
  import ServerList from '../components/ServerList.svelte';
  import EntityCard from '../components/EntityCard.svelte';
  import { activeClient } from '$lib/stores/servers';
</script>

<svelte:head>
  <title>Evolusion Dashboard</title>
</svelte:head>

<main>
  <h1>Evolusion - Home Assistant</h1>
  <ServerList />
  <h2>Entities</h2>
  {#if $activeClient}
    <div class="grid">
      {#each $activeClient.entities as entity (entity.entity_id)}
        <EntityCard {entity} />
      {/each}
    </div>
  {:else}
    <p>Connect to a server</p>
  {/if}
</main>

<style>
  main { padding: 2rem; max-width: 1400px; margin: 0 auto; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
</style>
