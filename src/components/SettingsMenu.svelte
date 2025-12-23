<script lang="ts">
  export let sidebarOpen: boolean;
  export let onSidebarToggle: () => void;

  let showMenu = false;

  function toggleMenu() {
    showMenu = !showMenu;
  }

  function closeMenu() {
    showMenu = false;
  }

  function handleSidebarToggle() {
    onSidebarToggle();
    closeMenu();
  }
</script>

<div class="settings-menu-container">
  <button class="settings-button" on:click={toggleMenu} aria-label="Settings menu">
    <span class="settings-icon">⋮</span>
  </button>

  {#if showMenu}
    <div class="settings-dropdown" on:click|stopPropagation={closeMenu}>
      <div class="settings-dropdown-content" on:click|stopPropagation>
        <a href="/servers" class="settings-item">
          <span class="settings-item-icon">🖥️</span>
          <span class="settings-item-text">Серверы Home Assistant</span>
        </a>

        <button class="settings-item" on:click={handleSidebarToggle}>
          <span class="settings-item-icon">
            {#if sidebarOpen}❌{:else}☰{/if}
          </span>
          <span class="settings-item-text">
            {#if sidebarOpen}Скрыть sidebar{:else}Показать sidebar{/if}
          </span>
        </button>

        <div class="settings-divider"></div>

        <a href="#" class="settings-item">
          <span class="settings-item-icon">⚙️</span>
          <span class="settings-item-text">Настройки дашборда</span>
        </a>
      </div>
    </div>
  {/if}
</div>

<style>
  .settings-menu-container {
    position: relative;
    display: inline-block;
  }

  .settings-button {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    font-size: 1.2rem;
  }

  .settings-button:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .settings-icon {
    display: block;
    line-height: 1;
  }

  .settings-dropdown {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 100;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
  }

  .settings-dropdown-content {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
    width: 240px;
    background: #1a1a1a;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    z-index: 101;
  }

  .settings-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    color: white;
    text-decoration: none;
    background: transparent;
    border: none;
    width: 100%;
    text-align: left;
    cursor: pointer;
    transition: background 0.2s ease;
    font-size: 0.9rem;
  }

  .settings-item:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .settings-item-icon {
    font-size: 1.1rem;
    width: 20px;
    text-align: center;
  }

  .settings-item-text {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .settings-divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
    margin: 0.25rem 0;
  }
</style>
