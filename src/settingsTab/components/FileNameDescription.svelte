<script lang="ts">
  import Chip from './Chip.svelte';
</script>

Template to use for creation of file names from a book.

<br />

<span>
  Available variables:
  <Chip title={'shortTitle'} />
  <Chip title={'longTitle'} />
  <Chip title={'authorTitle'} />
</span>
