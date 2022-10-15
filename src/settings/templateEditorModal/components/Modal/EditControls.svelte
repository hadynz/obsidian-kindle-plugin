<script lang="ts">
  import type { Writable } from 'svelte/store';

  export let writableStore: Writable<string>;
  export let defaultValue: string;
</script>

<div class="wrapper">
  {#if $writableStore == null}
    <button on:click={() => writableStore.set(defaultValue)}>Override default template</button>
  {:else}
    <button on:click={() => writableStore.set(undefined)}>Reset to default template</button>
  {/if}
</div>

<style>
  .wrapper {
    margin-top: 8px;
  }

  button {
    font-size: 0.8em;
  }
</style>
