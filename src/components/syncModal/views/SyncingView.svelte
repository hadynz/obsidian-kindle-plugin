<script lang="ts">
  import { tick } from 'svelte';
  import { Jumper } from 'svelte-loading-spinners';

  import { shortenTitle } from '~/utils';
  import { currentAmazonRegion } from '~/amazonRegion';
  import { syncCancellation } from '~/sync/syncCancellation';
  import { store } from '../store';

  let progressMessage: string;
  let isCopying = false;
  let copied = false;
  let detailsBodyEl: HTMLDivElement;
  let previousLogCount = 0;

  const formatDelta = (ms: number | undefined): string => {
    if (ms == null) {
      return '';
    }
    if (ms < 1000) {
      return `${ms}ms`;
    }
    if (ms < 60_000) {
      return `${(ms / 1000).toFixed(1)}s`;
    }
    return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000).toString()}s`;
  };

  const formatDuration = (ms: number | undefined): string => {
    if (ms == null) {
      return '';
    }
    if (ms < 1000) {
      return `${ms}ms`;
    }
    if (ms < 60_000) {
      return `${(ms / 1000).toFixed(1)}s`;
    }
    const minutes = Math.floor(ms / 60_000);
    const seconds = Math.round((ms % 60_000) / 1000);
    return `${minutes}m ${seconds.toString()}s`;
  };

  type MessagePart = {
    text: string;
    strong: boolean;
  };

  const splitMessage = (message: string): MessagePart[] => {
    const spans: Array<{ start: number; end: number }> = [];

    const quoted = /"[^"]+"/g;
    for (let m = quoted.exec(message); m; m = quoted.exec(message)) {
      spans.push({ start: m.index, end: m.index + m[0].length });
    }

    const amazonHost = /\bamazon\.[a-z.]+\b/g;
    for (let m = amazonHost.exec(message); m; m = amazonHost.exec(message)) {
      spans.push({ start: m.index, end: m.index + m[0].length });
    }

    const merged = spans
      .sort((a, b) => a.start - b.start)
      .reduce<Array<{ start: number; end: number }>>((acc, cur) => {
        const prev = acc[acc.length - 1];
        if (!prev || cur.start > prev.end) {
          acc.push(cur);
          return acc;
        }
        prev.end = Math.max(prev.end, cur.end);
        return acc;
      }, []);

    const parts: MessagePart[] = [];
    let pos = 0;
    for (const span of merged) {
      if (span.start > pos) {
        parts.push({ text: message.slice(pos, span.start), strong: false });
      }
      parts.push({ text: message.slice(span.start, span.end), strong: true });
      pos = span.end;
    }
    if (pos < message.length) {
      parts.push({ text: message.slice(pos), strong: false });
    }
    return parts.length > 0 ? parts : [{ text: message, strong: false }];
  };

  $: if ($store.status === 'sync:login') {
    const region = currentAmazonRegion();
    progressMessage = `Connecting to ${region.hostname}…`;
  } else if ($store.status === 'sync:cancelling') {
    progressMessage = 'Cancelling sync…';
  } else if ($store.status === 'sync:cancelled') {
    const synced = $store.syncedCount ?? 0;
    const total = $store.totalBooks ?? 0;
    if (total === 0 || synced === 0) {
      progressMessage = 'Sync cancelled — no books were synced';
    } else {
      progressMessage = `Sync cancelled — ${synced} of ${total} books synced`;
    }
  } else if ($store.status === 'sync:fetching-books' && $store.remoteBookCount) {
    const toSync = $store.totalBooks ?? 0;
    if (toSync > 0) {
      progressMessage = `Library loaded — ${toSync} to sync`;
    } else {
      progressMessage = 'Library loaded — all up to date';
    }
  } else if ($store?.syncMode === 'amazon') {
    progressMessage = 'Syncing highlights from Amazon Cloud…';
  } else {
    progressMessage = 'Syncing highlights from My Clippings…';
  }

  $: total = $store.jobs?.length ?? $store.totalBooks;
  $: synced = $store.syncedCount ?? 0;
  $: progressPercent = total && total > 0 ? Math.round((synced / total) * 100) : 0;
  $: isCancelling = $store.isCancelling;

  $: highlights = $store.highlightsSynced ?? 0;
  $: duration = $store.syncDurationMs;
  $: errorCount = $store.erroredJobs.length;

  $: details = $store.activityLog;

  const scrollLogToBottom = async (): Promise<void> => {
    await tick();

    if (!detailsBodyEl) {
      return;
    }

    detailsBodyEl.scrollTop = detailsBodyEl.scrollHeight;
  };

  $: if (details.length !== previousLogCount) {
    previousLogCount = details.length;
    void scrollLogToBottom();
  }

  const formatLogText = (): string => {
    return details
      .map((entry) => {
        const delta = entry.deltaMs != null ? `+${formatDelta(entry.deltaMs)}` : '';
        const indent = ' '.repeat(entry.indent * 2);
        return `${delta}\t${indent}${entry.message}`.trimEnd();
      })
      .join('\n');
  };

  const copyLog = async (): Promise<void> => {
    if (isCopying) {
      return;
    }

    isCopying = true;
    try {
      const text = formatLogText();
      await navigator.clipboard.writeText(text);
      copied = true;
      window.setTimeout(() => {
        copied = false;
      }, 1500);
    } catch (error) {
      console.warn('Failed to copy sync log', error);
    } finally {
      isCopying = false;
    }
  };

  function handleCancel() {
    syncCancellation.cancel();
  }

  export let onDone: () => void;
</script>

{#if $store.status === 'sync:complete'}
  <div class="kp-syncmodal--sync-content">
    <div class="kp-syncmodal--complete-icon">✓</div>
    <div class="kp-syncmodal--progress">
      {#if synced > 0}
        <div class="kp-syncmodal--complete-stats">
          <span class="kp-syncmodal--complete-count">{synced}</span>
          <span class="kp-syncmodal--complete-label">
            {synced === 1 ? 'book' : 'books'} synced
          </span>
        </div>
        {#if highlights > 0}
          <div class="kp-syncmodal--complete-highlights">
            {highlights}
            {highlights === 1 ? 'highlight' : 'highlights'}
          </div>
        {/if}
        {#if duration}
          <div class="kp-syncmodal--complete-duration">
            Completed in {formatDuration(duration)}
          </div>
        {/if}
      {:else}
        <span class="kp-syncmodal--progress-message">All books up to date</span>
      {/if}
      {#if errorCount > 0}
        <div class="kp-syncmodal--complete-errors">
          {errorCount} {errorCount === 1 ? 'book' : 'books'} could not be synced due to errors.
          Open Developer Tools (Cmd+Option+I, or View → Toggle Developer Tools) and check the
          Console tab for details, or see "Details" below.
        </div>
      {/if}
    </div>
  </div>
  {#if details.length > 0}
    <div class="kp-syncmodal--details">
      <div class="kp-syncmodal--details-header">
        <span class="kp-syncmodal--details-title">Details</span>
        <button class="kp-syncmodal--details-toggle" disabled={isCopying} on:click={copyLog}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div class="kp-syncmodal--details-body" bind:this={detailsBodyEl}>
        {#each details as entry, i (entry.timestamp + i)}
          <div class="kp-syncmodal--details-line">
            <span
              class="kp-syncmodal--details-text"
              style="padding-left: {entry.indent * 12}px"
            >
              {#each splitMessage(entry.message) as part}
                <span class:kp-syncmodal--log-strong={part.strong}>{part.text}</span>
              {/each}
            </span>
            <span class="kp-syncmodal--details-delta"
              >{entry.deltaMs != null ? `+${formatDelta(entry.deltaMs)}` : ''}</span
            >
          </div>
        {/each}
      </div>
    </div>
  {/if}
  <div class="setting-item-control">
    <button class="mod-cta" on:click={onDone}>Done</button>
  </div>
{:else if $store.status === 'sync:cancelled'}
  <div class="kp-syncmodal--sync-content">
    <div class="kp-syncmodal--cancelled-icon">✓</div>
    <div class="kp-syncmodal--progress">
      <span class="kp-syncmodal--progress-message">{progressMessage}</span>
      {#if duration}
        <div class="kp-syncmodal--complete-duration">Ran for {formatDuration(duration)}</div>
      {/if}
    </div>
  </div>
  {#if details.length > 0}
    <div class="kp-syncmodal--details">
      <div class="kp-syncmodal--details-header">
        <span class="kp-syncmodal--details-title">Details</span>
        <button class="kp-syncmodal--details-toggle" disabled={isCopying} on:click={copyLog}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div class="kp-syncmodal--details-body" bind:this={detailsBodyEl}>
        {#each details as entry, i (entry.timestamp + i)}
          <div class="kp-syncmodal--details-line">
            <span
              class="kp-syncmodal--details-text"
              style="padding-left: {entry.indent * 12}px"
            >
              {#each splitMessage(entry.message) as part}
                <span class:kp-syncmodal--log-strong={part.strong}>{part.text}</span>
              {/each}
            </span>
            <span class="kp-syncmodal--details-delta"
              >{entry.deltaMs != null ? `+${formatDelta(entry.deltaMs)}` : ''}</span
            >
          </div>
        {/each}
      </div>
    </div>
  {/if}
  <div class="setting-item-control">
    <button class="mod-cta" on:click={onDone}>OK</button>
  </div>
{:else if $store.erroredJobs.length > 0 && !$store.currentJob}
  <div class="kp-syncmodal--error">
    {`${$store.erroredJobs.length} books(s) could not be synced because of errors`}
  </div>
  {#if details.length > 0}
    <div class="kp-syncmodal--details">
      <div class="kp-syncmodal--details-header">
        <span class="kp-syncmodal--details-title">Details</span>
        <button class="kp-syncmodal--details-toggle" disabled={isCopying} on:click={copyLog}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div class="kp-syncmodal--details-body" bind:this={detailsBodyEl}>
        {#each details as entry, i (entry.timestamp + i)}
          <div class="kp-syncmodal--details-line">
            <span
              class="kp-syncmodal--details-text"
              style="padding-left: {entry.indent * 12}px"
            >
              {#each splitMessage(entry.message) as part}
                <span class:kp-syncmodal--log-strong={part.strong}>{part.text}</span>
              {/each}
            </span>
            <span class="kp-syncmodal--details-delta"
              >{entry.deltaMs != null ? `+${formatDelta(entry.deltaMs)}` : ''}</span
            >
          </div>
        {/each}
      </div>
    </div>
  {/if}
  <div class="setting-item-control">
    <button class="mod-cta" on:click={onDone}>OK</button>
  </div>
{:else}
  <div class="kp-syncmodal--sync-content">
    <Jumper color="#7f6df2" size="90" duration="1.6s" />

    <div class="kp-syncmodal--progress">
      {#if $store.currentJob}
        <div class="kp-syncmodal--download">
          Syncing
          <span class="kp-syncmodal--book-name">
            {shortenTitle($store.currentJob.book.title)}
          </span>
        </div>
        <div class="kp-syncmodal--bar-wrapper">
          <div class="kp-syncmodal--bar-track">
            <div class="kp-syncmodal--bar-fill" style="width: {progressPercent}%" />
          </div>
          <span class="kp-syncmodal--bar-label">
            {synced} of {total}
          </span>
        </div>
      {:else}
        <span class="kp-syncmodal--progress-message">{progressMessage}</span>
      {/if}
    </div>
  </div>

  {#if details.length > 0}
    <div class="kp-syncmodal--details">
      <div class="kp-syncmodal--details-header">
        <span class="kp-syncmodal--details-title">Details</span>
        <button class="kp-syncmodal--details-toggle" disabled={isCopying} on:click={copyLog}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div class="kp-syncmodal--details-body" bind:this={detailsBodyEl}>
        {#each details as entry, i (entry.timestamp + i)}
          <div class="kp-syncmodal--details-line">
            <span
              class="kp-syncmodal--details-text"
              style="padding-left: {entry.indent * 12}px"
            >
              {#each splitMessage(entry.message) as part}
                <span class:kp-syncmodal--log-strong={part.strong}>{part.text}</span>
              {/each}
            </span>
            <span class="kp-syncmodal--details-delta"
              >{entry.deltaMs != null ? `+${formatDelta(entry.deltaMs)}` : ''}</span
            >
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <div class="setting-item-control">
    {#if isCancelling}
      <button class="mod-muted" disabled>Cancelling…</button>
    {:else}
      <button class="mod-warning" on:click={handleCancel}>Cancel sync</button>
    {/if}
  </div>
{/if}

<style>
  .kp-syncmodal--download {
    color: var(--text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 350px;
    margin: 0 auto 12px;
    text-align: center;
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

  .kp-syncmodal--bar-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 320px;
    margin: 0 auto;
  }

  .kp-syncmodal--bar-track {
    flex: 1;
    height: 6px;
    background: var(--background-modifier-border);
    border-radius: 3px;
    overflow: hidden;
  }

  .kp-syncmodal--bar-fill {
    height: 100%;
    background: var(--interactive-accent);
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .kp-syncmodal--bar-label {
    color: var(--text-muted);
    font-size: 0.85em;
    white-space: nowrap;
  }

  .kp-syncmodal--details {
    width: 520px;
    max-width: 100%;
    margin: 12px auto 0;
    padding: 10px 12px;
    border: 1px solid var(--background-modifier-border);
    border-radius: 6px;
    background: var(--background-secondary);
  }

  :global(.setting-item-control) {
    margin-top: 12px;
  }

  .kp-syncmodal--details-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .kp-syncmodal--details-title {
    font-size: 0.85em;
    color: var(--text-muted);
  }

  .kp-syncmodal--details-toggle {
    border: none;
    background: none;
    padding: 4px 6px;
    cursor: pointer;
    color: var(--text-muted);
    font-size: 0.85em;
  }

  .kp-syncmodal--details-toggle:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .kp-syncmodal--details-toggle:hover {
    color: var(--text-normal);
  }

  .kp-syncmodal--details-body {
    height: 160px;
    overflow: auto;
  }

  .kp-syncmodal--details-line {
    display: flex;
    gap: 10px;
    font-size: 0.9em;
    line-height: 1.4;
    color: var(--text-normal);
    padding: 2px 0;
    word-break: break-word;
  }

  .kp-syncmodal--details-delta {
    flex: 0 0 64px;
    text-align: right;
    color: var(--text-faint);
    font-size: 0.85em;
    line-height: 1.4;
    font-variant-numeric: tabular-nums;
    font-family: var(--font-monospace);
  }

  .kp-syncmodal--details-text {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .kp-syncmodal--log-strong {
    color: var(--text-normal);
    font-weight: 600;
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

  .kp-syncmodal--complete-icon {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: var(--text-success, var(--interactive-accent));
    border: 1px solid var(--text-success, var(--interactive-accent));
    color: var(--background-primary);
    font-size: 2.1em;
    margin-bottom: 10px;
  }

  .kp-syncmodal--cancelled-icon {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: var(--background-modifier-border);
    border: 1px solid var(--background-modifier-border);
    color: var(--text-muted);
    font-size: 2.1em;
    margin-bottom: 10px;
  }

  .kp-syncmodal--complete-stats {
    display: flex;
    align-items: baseline;
    gap: 8px;
    justify-content: center;
  }

  .kp-syncmodal--complete-count {
    font-size: 2.4em;
    color: var(--text-success, var(--interactive-accent));
    line-height: normal;
  }

  .kp-syncmodal--complete-label {
    font-size: 1.2em;
    color: var(--text-normal);
  }

  .kp-syncmodal--complete-highlights {
    color: var(--text-muted);
    font-size: 0.95em;
    margin-top: 4px;
  }

  .kp-syncmodal--complete-duration {
    color: var(--text-faint);
    font-size: 0.85em;
    margin-top: 6px;
  }

  .kp-syncmodal--complete-errors {
    color: var(--text-error);
    font-size: 0.85em;
    margin-top: 14px;
    max-width: 420px;
    text-align: center;
  }
</style>
