<script lang="ts">
  import SyncStats from './SyncStats.svelte';

  export let onClick: () => void;
  export let lastSyncDate: Date;
  export let totalBooks: number;
  export let totalHighlights: number;
</script>

<SyncStats {lastSyncDate} {totalBooks} {totalHighlights} />
<div class="setting-item-control">
  <button class="mod-cta" on:click={onClick}>Sync...</button>
</div>
