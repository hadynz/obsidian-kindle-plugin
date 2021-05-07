<script lang="ts">
  import IdleView from './IdleView.svelte';
  import SyncingView from './SyncingView.svelte';

  import { syncSessionStore, settingsStore } from '../../store';
  import type { SyncMode } from '.';

  export let sync: (mode: SyncMode) => void;

  const idleViewProps = {
    syncAmazon: () => sync('amazon'),
    syncClippings: () => sync('my-clippings'),
    lastSyncDate: $settingsStore.lastSyncDate,
    totalBooks: $settingsStore.history.totalBooks,
    totalHighlights: $settingsStore.history.totalHighlights,
  };
</script>

{#if $syncSessionStore.status === 'idle'}
  <IdleView {...idleViewProps} />
{:else}
  <SyncingView />
{/if}
