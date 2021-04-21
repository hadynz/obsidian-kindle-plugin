<script>
  import { Jumper } from 'svelte-loading-spinners';
  const moment = window.moment;

  export let lastSyncDate, booksSyncCount, isSyncing;
</script>

<style>
  .kindle-plugin--wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .kindle-plugin--icon {
    margin-right: 3px;
  }
</style>

<div class="kindle-plugin--wrapper">
  {#if isSyncing}
    <div class="kindle-plugin--icon">
      <Jumper color="#7f6df2" size="18" duration="1.2s" />
    </div>
  {/if}
  <div class="kindle-plugin--status">
    {#if lastSyncDate}
      {booksSyncCount} book(s) synced. Last sync {moment(lastSyncDate).fromNow()}
    {:else}
      Kindle sync has never run
    {/if}
  </div>
</div>
