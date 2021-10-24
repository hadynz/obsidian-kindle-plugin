<script lang="ts">
  import IdleView from './views/IdleView.svelte';
  import SyncingView from './views/SyncingView.svelte';
  import FirstTimeView from './views/FirstTimeView.svelte';
  import SyncButtons from './views/SyncButtons.svelte';
  import { store } from './store';
  import type { SyncMode } from '~/models';

  export let onDone: () => void;
  export let onClick: (mode: SyncMode) => void;
</script>

{#if $store.status === 'idle'}
  <IdleView
    onClick={() => {
      store.update((p) => ({ ...p, status: 'choose-sync-method' }));
    }}
  />
{:else if $store.status.startsWith('sync:')}
  <SyncingView {onDone} />
{:else if $store.status === 'choose-sync-method'}
  <SyncButtons {onClick} />
{:else if $store.status === 'first-time'}
  <FirstTimeView {onClick} />
{/if}
