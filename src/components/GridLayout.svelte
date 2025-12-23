<script lang="ts">
  export let columns: number = 3;
  export let gap: number = 16;

  // Calculate grid template columns based on columns prop
  $: gridTemplateColumns = `repeat(${columns}, 1fr)`;
</script>

<div class="grid-layout" style={`grid-template-columns: ${gridTemplateColumns}; gap: ${gap}px;`}>
  <slot />
</div>

<style>
  .grid-layout {
    display: grid;
    width: 100%;
    padding: 0;
  }

  @media (max-width: 1024px) {
    .grid-layout {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }

  @media (max-width: 640px) {
    .grid-layout {
      grid-template-columns: repeat(1, 1fr) !important;
    }
  }
</style>
