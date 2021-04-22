<script>
  import { Jumper } from 'svelte-loading-spinners';
  const moment = window.moment;

  export let isSyncing, sync, cancelSync, booksSyncCount, lastSyncDate;
</script>

<style>
  .kp-syncmodal--sync-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 40px 0;
  }

  .kp-syncmodal--nosync-content {
    margin-bottom: 20px;
  }

  .kp-syncmodal--progress {
    margin: 20px 0;
    font-size: 1.6em;
  }
</style>
{#if isSyncing}
Downloading your Kindle highlights from Amazon.

<div class="kp-syncmodal--sync-content">
  <Jumper color="#7f6df2" size="90" duration="1.6s" />
  <div class="setting-item-name kp-syncmodal--progress">86%</div>
  <div class="setting-item-description kp-syncmodal--file">Downloading <b class="cm-highlight">Animal Farm</b>...</div>
</div>

<div class="setting-item">
  <div class="setting-item-control">
    <button class="mod-warning" on:click={cancelSync}>Stop sync</button>
    <button class="mod-muted" disabled>Syncing...</button>
  </div>
</div>
{:else}
<div class="kp-syncmodal--nosync-content">
  {#if lastSyncDate}
    {booksSyncCount} book(s) synced<br/>
    Last sync {moment(lastSyncDate).fromNow()}
  {:else}
    Kindle sync has never run
  {/if}
</div>

<div class="setting-item">
  <div class="setting-item-control">
    <button class="mod-cta" on:click={sync}>Sync now</button>
  </div>
</div>
{/if}
