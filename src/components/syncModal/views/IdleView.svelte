<script lang="ts">
  import type { SyncMode } from '../../../models';
  import SyncStats from './SyncStats.svelte';
  import FirstTimeText from './FirstTimeText.svelte';
  import SyncButtons from './SyncButtons.svelte';

  export let syncAmazon: () => void;
  export let syncClippings: () => void;
  export let lastSyncDate: Date;
  export let lastSyncMode: SyncMode;
  export let totalBooks: number;
  export let totalHighlights: number;
</script>

<div class="kp-syncmodal--nosync-content">
  {#if lastSyncDate}
    <SyncStats {lastSyncDate} {totalBooks} {totalHighlights} />
  {:else}
    <FirstTimeText />
  {/if}
</div>

<SyncButtons {syncAmazon} {syncClippings} {lastSyncMode} />

<style>
  .kp-syncmodal--nosync-content {
    margin-bottom: 20px;
  }
</style>
