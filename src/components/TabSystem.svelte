<script lang="ts">
  export let tabs: string[] = ['Home', 'Living Room', 'Server Rack', 'Multimedia', 'Climate', 'Entities'];
  export let activeTab: string = 'Home';

  function selectTab(tab: string) {
    activeTab = tab;
  }
</script>

<div class="tab-system">
  <div class="tab-header">
    {#each tabs as tab}
      <button
        class="tab-button"
        class:active={activeTab === tab}
        on:click={() => selectTab(tab)}
      >
        {tab}
      </button>
    {/each}
  </div>

  <div class="tab-content">
    <slot name="Home" />
    <slot name="Living Room" />
    <slot name="Server Rack" />
    <slot name="Multimedia" />
    <slot name="Climate" />
    <slot name="Entities" />
  </div>
</div>

<style>
  .tab-system {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .tab-header {
    display: flex;
    gap: 0.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    overflow-x: auto;
    background: transparent;
    position: sticky;
    top: 0;
    z-index: 5;
    padding: 0 1rem;
    margin-bottom: 1rem;
  }

  .tab-button {
    padding: 0.75rem 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: none;
    cursor: pointer;
    border-radius: 8px 8px 0 0;
    white-space: nowrap;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
    transition: all 0.2s ease;
    border-bottom: 2px solid transparent;
  }

  .tab-button:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }

  .tab-button.active {
    color: white;
    background: rgba(59, 130, 246, 0.2);
    border-bottom-color: #3b82f6;
    font-weight: 600;
  }

  .tab-content {
    padding: 1rem;
    flex: 1;
    overflow-y: auto;
  }
</style>
