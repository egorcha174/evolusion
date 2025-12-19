<script lang="ts">
  import type { UiEntity } from '$lib/models';
  export let entity: UiEntity;
</script>

<div class="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow border border-gray-100 flex flex-col h-full">
  <div class="flex items-start justify-between mb-2">
    <div class="flex items-center gap-2 overflow-hidden">
      <div class="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-full shrink-0">
        {#if entity.kind === 'light'}💡{:else if entity.kind === 'switch'}🔌{:else if entity.kind === 'sensor'}📊{:else if entity.kind === 'button'}🔘{:else}🏠{/if}
      </div>
      <div class="overflow-hidden">
        <h3 class="font-medium text-gray-900 truncate" title={entity.name}>{entity.name}</h3>
        <p class="text-[10px] text-gray-400 font-mono truncate">{entity.id}</p>
      </div>
    </div>
  </div>

  <div class="py-2">
    <slot />
  </div>

  <div class="mt-auto pt-2 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
    <span>{entity.kind}</span>
    <span class:text-blue-500={entity.state === 'on' || entity.state === 'active'}>{entity.state}</span>
  </div>
</div>
