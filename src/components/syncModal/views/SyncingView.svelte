<script lang="ts">
  import { Jumper } from 'svelte-loading-spinners';

  import { santizeTitleExcess } from '~/utils';
  import { syncSessionStore } from '~/store';
  import { currentAmazonRegion } from '~/amazonRegion';

  let progressMessage: string;

  $: if ($syncSessionStore.status === 'login') {
    const region = currentAmazonRegion();
    progressMessage = `Logging into ${region.hostname}`;
  } else if ($syncSessionStore?.method === 'amazon') {
    progressMessage = 'Looking for new Kindle highlights to sync...';
  } else {
    progressMessage =
      'Parsing your Clippings files for highlights and notes...';
  }

  $: doneTotal =
    $syncSessionStore.jobs.filter((j) => j.status === 'done').length + 1;

  $: total = $syncSessionStore.jobs.length;

  $: currentJob = $syncSessionStore.jobs.find(
    (job) => job.status === 'in-progress'
  );

  export let onDone: () => void;
</script>

{#if $syncSessionStore.status === 'error'}
  <div class="kp-syncmodal--error">
    {$syncSessionStore.errorMessage}
  </div>
  <div class="setting-item-control">
    <button class="mod-cta" on:click={onDone}>OK</button>
  </div>
{:else}
  <div class="kp-syncmodal--sync-content">
    <Jumper color="#7f6df2" size="90" duration="1.6s" />

    <div class="kp-syncmodal--progress">
      {#if currentJob}
        <span class="kp-syncmodal--progress-current">{doneTotal}</span>
        <span class="kp-syncmodal--progress-total">/ {total}</span>
        <div class="kp-syncmodal--download">
          Synching
          <span class="kp-syncmodal--book-name">
            {santizeTitleExcess(currentJob.book.title)}
          </span>
        </div>
      {:else}
        <span class="kp-syncmodal--progress-message">{progressMessage}</span>
      {/if}
    </div>
  </div>

  <div class="setting-item-control">
    <button class="mod-muted" disabled>Syncing...</button>
  </div>
{/if}

<style>
  .kp-syncmodal--download {
    color: var(--text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 350px;
    margin: 10px 100px 0;
  }

  .kp-syncmodal--book-name {
    color: var(--text-normal);
    font-weight: bold;
  }

  .kp-syncmodal--progress {
    margin: 30px 0 15px;
    text-align: center;
  }

  .kp-syncmodal--progress-message {
    font-size: 1.2em;
  }

  .kp-syncmodal--progress-current {
    font-size: 2.4em;
  }

  .kp-syncmodal--progress-total {
    color: var(--text-muted);
    font-size: 1.6em;
  }

  .kp-syncmodal--error {
    font-size: 0.9em;
    color: var(--text-error);
    margin: 40px 0;
    max-width: 500px;
  }

  .kp-syncmodal--sync-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 40px 0;
  }
</style>
