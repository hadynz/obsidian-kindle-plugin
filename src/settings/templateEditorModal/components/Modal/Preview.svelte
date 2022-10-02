<script lang="ts">
  import { demoBooks, renderedFileName, renderedFile, selectedBook } from '../../store';
</script>

<div class="wrapper">
  <h1>Live Preview</h1>

  <div class="text">Select different books to see how your templates will render out in different scenarios</div>

  <select class="dropdown" bind:value={$selectedBook}>
    {#each $demoBooks as demoBook}
      <option value={demoBook}>{demoBook.book.title} ({demoBook.book.author})</option>
    {/each}
  </select>

  <div class="text label">File name</div>
  <pre>{$renderedFileName}</pre>

  <div class="text label">File markup</div>
  <pre>{$renderedFile}</pre>
</div>

<style>
  .wrapper {
    width: 500px;
  }

  pre {
    white-space: pre-wrap;
    background-color: var(--background-secondary-alt);
    padding: 8px 20px;
    margin-top: 0;
  }

  .dropdown {
    margin: 20px 0;
  }

  .text {
    font-size: 0.9em;
  }

  .label {
    color: var(--text-muted);
  }
</style>
