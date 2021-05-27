<script lang="ts">
  import IdleView from './views/IdleView.svelte';
  import SyncingView from './views/SyncingView.svelte';
  import FirstTimeView from './views/FirstTimeView.svelte';
  import SyncButtons from './views/SyncButtons.svelte';

  import { settingsStore } from '~/store';
  import type { SyncMode } from '~/models';
  import type { SyncModalState } from './index';

  export let modalState: SyncModalState;
  export let onDone: () => void;
  export let onClick: (mode: SyncMode) => void;
  export let setModalTitle: (modalState: SyncModalState) => void;

  const idleViewProps = {
    lastSyncDate: $settingsStore.lastSyncDate,
    totalBooks: $settingsStore.history.totalBooks,
    totalHighlights: $settingsStore.history.totalHighlights,
  };
</script>

{#if modalState === 'idle'}
  <IdleView
    {...idleViewProps}
    onClick={() => {
      modalState = 'choose-sync-method';
      setModalTitle(modalState);
    }}
  />
{:else if modalState === 'syncing'}
  <SyncingView {onDone} />
{:else if modalState === 'choose-sync-method'}
  <SyncButtons lastSyncMode={$settingsStore.lastSyncMode} {onClick} />
{:else if modalState === 'first-time'}
  <FirstTimeView lastSyncMode={$settingsStore.lastSyncMode} {onClick} />
{/if}
