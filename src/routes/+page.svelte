<script lang="ts">
  import ServerList from '../components/ServerList.svelte';
  import EntityCard from '../components/EntityCard.svelte';
  import { activeClient } from '$lib/stores/servers';
  import { get } from 'svelte/store';
  
	let entities: any[] = [];<svelte:head>
	$: if ($activeClient) {
		const unsubscribe = $activeClient.entities.subscribe(value => entities = value);  <title>Evolusion Dashboard</title>
</svelte:head>
</script>

<main>
  <h1>Evolusion - Home Assistant</h1>
  <ServerList />
  <h2>Entities</h2>
  {#if $activeClient}
    <div class="grid">
          {#each entities as entity (entity.entity_id)}
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
