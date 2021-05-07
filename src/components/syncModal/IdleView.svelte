<script lang="ts">
  import FirstTimeText from './FirstTimeText.svelte';

  const { moment } = window;

  export let syncAmazon: () => void;
  export let syncClippings: () => void;
  export let lastSyncDate: Date;
  export let totalBooks: number;
  export let totalHighlights: number;
</script>

<div class="kp-syncmodal--nosync-content">
  {#if lastSyncDate}
    {totalBooks} book(s) synced<br />
    {totalHighlights} highlights synced<br />
    Last sync {moment(lastSyncDate).fromNow()}
  {:else}
    <FirstTimeText />
  {/if}
</div>
<div class="setting-item">
  <div class="setting-item-control">
    <button class="mod-cta" on:click={syncClippings}>
      Upload My Clippings.txt
    </button>
    <button class="mod-cta" on:click={syncAmazon}>Sync using Amazon</button>
  </div>
</div>

<style>
  .kp-syncmodal--nosync-content {
    margin-bottom: 20px;
  }
</style>
