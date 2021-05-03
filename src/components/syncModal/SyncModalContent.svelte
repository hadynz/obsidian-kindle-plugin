<script lang="ts">
  import { Jumper } from 'svelte-loading-spinners';

  import { santizeTitle } from '../../utils';
  import { syncSessionStore, settingsStore } from '../../store';

  const { moment } = window;

  $: percentage = (
    ($syncSessionStore.jobs.filter((j) => j.status === 'done').length /
      $syncSessionStore.jobs.length) *
    100
  ).toFixed(0);

  $: currentJob = $syncSessionStore.jobs.find(
    (job) => job.status === 'in-progress'
  );

  export let startSync: () => void, startUpload: () => void;
</script>

{#if $syncSessionStore.status === 'idle'}
  <div class="kp-syncmodal--nosync-content">
    {#if $settingsStore.lastSyncDate}
      {$settingsStore.history.totalBooks} book(s) synced<br />
      Last sync {moment($settingsStore.lastSyncDate).fromNow()}
    {:else}
      <p>
        Start syncing your Kindle highlights now and leverage Obsidian's ability
        to map and traverse your data.
      </p>
      <p>You can sync in two ways:</p>
      <ul>
        <li>Sync via Amazon's Kindle Reader</li>
        <li>Upload your Kindle My Clippings text file</li>
      </ul>
    {/if}
  </div>
  <div class="setting-item">
    <div class="setting-item-control">
      <button class="mod-cta" on:click={startUpload}>
        Upload My Clippings.txt
      </button>
      <button class="mod-cta" on:click={startSync}>Sync using Amazon</button>
    </div>
  </div>
{:else}
  {#if $syncSessionStore?.method === 'amazon'}
    Downloading your Kindle highlights from Amazon.
  {:else if $syncSessionStore?.method === 'clippings-file'}
    Uploading Kindle highlights from your Clippings file.
  {/if}

  <div class="kp-syncmodal--sync-content">
    <Jumper color="#7f6df2" size="90" duration="1.6s" />
    {#if currentJob}
      <div class="setting-item-name kp-syncmodal--progress">{percentage}%</div>
      <div class="setting-item-description kp-syncmodal--file">
        Downloading <b>{santizeTitle(currentJob.book.title)}</b>
      </div>
    {:else if $syncSessionStore?.method === 'amazon'}
      Looking for new Kindle highlights to sync...
    {:else if $syncSessionStore?.method === 'clippings-file'}
      Parsing your Clippings files for highlights and notes.
    {/if}
  </div>

  <div class="setting-item">
    <div class="setting-item-control">
      <button class="mod-muted" disabled>Syncing...</button>
    </div>
  </div>
{/if}

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
