<script lang="ts">
  import type { Writable } from 'svelte/store';

  import hashIcon from '~/assets/hashIcon.svg';

  export let writableStore: Writable<string>;
  export let defaultValue: string;
  export let showTipsModal: () => void;
</script>

<div class="wrapper">
  {#if $writableStore == null}
    <button on:click={() => writableStore.set(defaultValue)}>Override default template</button>
  {:else}
    <button on:click={() => writableStore.set(undefined)}>Reset to default template</button>
  {/if}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    on:click={showTipsModal}
    class="clickable-icon"
    aria-label="See available template variables"
  >
    {@html hashIcon}
  </div>
</div>

<style>
  .wrapper {
    margin-top: 8px;
    display: flex;
    gap: 4px;
  }

  button {
    font-size: 0.8em;
  }
</style>
