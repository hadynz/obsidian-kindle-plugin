<script lang="ts">
  import IdleView from './views/IdleView.svelte';
  import SyncingView from './views/SyncingView.svelte';

  import { syncSessionStore, settingsStore } from '../../store';
  import type { SyncMode } from '../../models';

  export let sync: (mode: SyncMode) => void;

  const idleViewProps = {
    syncAmazon: () => sync('amazon'),
    syncClippings: () => sync('my-clippings'),
    lastSyncDate: $settingsStore.lastSyncDate,
    lastSyncMode: $settingsStore.lastSyncMode,
    totalBooks: $settingsStore.history.totalBooks,
    totalHighlights: $settingsStore.history.totalHighlights,
  };
</script>

{#if $syncSessionStore.status === 'idle'}
  <IdleView {...idleViewProps} />
{:else}
  <SyncingView />
{/if}
