<script lang="ts">
  import SyncStats from './SyncStats.svelte';

  export let onClick: () => void;
</script>

<SyncStats />
<div class="setting-item-control">
  <button class="mod-cta" on:click={onClick}>Sync...</button>
</div>
