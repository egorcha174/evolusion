<script lang="ts">
  import type { UiEntity } from '$lib/models';
  import BinaryCard from './cards/BinaryCard.svelte';
  import SensorCard from './cards/SensorCard.svelte';
  import InfoCard from './cards/InfoCard.svelte';

  export let entity: UiEntity;
</script>

<!-- 
  Диспетчер карточек: выбирает правильный компонент на основе типа сущности (kind)
-->
{#if entity.kind === 'binary'}
  <BinaryCard {entity} />
{:else if entity.kind === 'sensor'}
  <SensorCard {entity} />
{:else}
  <InfoCard {entity} />
{/if}

<style>
  /* Стили будут в конкретных компонентах карточек */
</style>
