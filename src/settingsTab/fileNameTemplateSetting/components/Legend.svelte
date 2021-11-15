<script lang="ts">
  import Chip from './Chip.svelte';
</script>

<div class="wrapper">
  <span class="legend">Available variables:</span>
  <Chip title={'shortTitle'} />
  <Chip title={'longTitle'} />
  <Chip title={'author'} />
</div>

<style>
  .wrapper {
    margin-bottom: 10px;
  }

  .legend {
    font-size: 0.8em;
  }
</style>
