<script>
  import { Jumper } from 'svelte-loading-spinners';

  import { santizeTitle } from '../../fileManager';
  import store from '../../store';

  const moment = window.moment;

  export let startSync;
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

{#if $store.status === 'idle'}
  <div class="kp-syncmodal--nosync-content">
    {#if $store.lastSyncDate}
      {$store.synchedBookAsins.length} book(s) synced<br/>
      Last sync {moment($store.lastSyncDate).fromNow()}
    {:else}
      Kindle sync has never run
    {/if}
  </div>

  <div class="setting-item">
    <div class="setting-item-control">
      <button class="mod-cta" on:click={startSync}>Sync now</button>
    </div>
  </div>
{:else}
  Downloading your Kindle highlights from Amazon.

  <div class="kp-syncmodal--sync-content">
    <Jumper color="#7f6df2" size="90" duration="1.6s" />
    {#if $store.jobs.length === 0}
      Looking for new Kindle highlights to sync...
    {:else}
      <div class="setting-item-name kp-syncmodal--progress">{($store.done.length/$store.jobs.length * 100).toFixed(0)}%</div>
      {#if $store.inProgress}
        <div class="setting-item-description kp-syncmodal--file">Downloading <b>{santizeTitle($store.inProgress?.title)}</b></div>
      {/if}
    {/if}
  </div>

  <div class="setting-item">
    <div class="setting-item-control">
      <button class="mod-muted" disabled>Syncing...</button>
    </div>
  </div>
{/if}
