<script lang="ts">
  import SyncButtons from './SyncButtons.svelte';
  import type { SyncMode } from '~/models';

  export let onClick: (mode: SyncMode) => void;
</script>

<div class="kp-firsttime--wrapper">
  <div class="kp-firsttime-welcome-column">
    <h1 class="kp-firsttime-heading">Let's Get Started</h1>
    <p class="kp-firsttime-secondary">
      Liberate your Kindle highlights and <span class="kp-firsttime--highlight"
        >[[connect]]</span
      > them to your second brain in Obsidian
    </p>
  </div>
  <div>
    <SyncButtons {onClick} />
  </div>
</div>

<style>
  .kp-firsttime--wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 50px 0;
  }

  .kp-firsttime-welcome-column {
    margin-right: 50px;
    width: 330px;
  }

  .kp-firsttime-heading {
    font-size: 3em;
    line-height: 1.1em;
  }

  .kp-firsttime-secondary {
    font-size: 1.2em;
    color: var(--text-muted);
    line-height: 1.5em;
  }

  .kp-firsttime--highlight {
    color: var(--text-accent);
  }
</style>
