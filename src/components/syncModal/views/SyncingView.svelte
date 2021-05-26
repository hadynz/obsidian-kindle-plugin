<script lang="ts">
  import { Jumper } from 'svelte-loading-spinners';
  import BookItem from './BookItem.svelte';

  import { santizeTitleExcess } from '../../../utils';
  import { syncSessionStore } from '../../../store';

  let progressMessage: string;

  $: if ($syncSessionStore.status === 'login') {
    progressMessage = 'Logging into Amazon.com';
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
  <div class="books-list grid-container">
    <table>
      {#each $syncSessionStore.jobs as job, index}
        <BookItem index={index + 1} book={job.book} />
      {/each}
    </table>
  </div>

  <div class="setting-item-control">
    <button class="mod-muted" disabled>Syncing...</button>
  </div>
{/if}

<style>
  .books-list {
    overflow-y: scroll;
    height: 300px;
    width: 500px;
  }

  .kp-syncmodal--error {
    font-size: 0.9em;
    color: var(--text-error);
    margin: 40px 0;
    max-width: 500px;
  }
</style>
