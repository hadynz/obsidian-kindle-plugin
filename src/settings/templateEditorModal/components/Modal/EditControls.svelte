<script lang="ts">
  import type { Writable } from 'svelte/store';

  export let writableStore: Writable<string>;
  export let defaultValue: string;
</script>

<div class="wrapper">
  {#if $writableStore == null}
    <a class="action" href="/" on:click={() => writableStore.set(defaultValue)}>
      Override default template
    </a>
  {:else}
    <a class="action" href="/" on:click={() => writableStore.set(undefined)}>Reset</a>
  {/if}
</div>

<style>
  .wrapper {
    margin-top: 8px;
  }

  .action {
    font-size: 0.8em;
  }
</style>
