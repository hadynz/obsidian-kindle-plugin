<script lang="ts">
  import { demoBooks, renderedFileName, renderedFile, selectedBook } from '../../store';
</script>

<div class="wrapper">
  <select class="bookSelect dropdown" bind:value={$selectedBook}>
    {#each $demoBooks as demoBook}
      <option value={demoBook}>{demoBook.book.title} ({demoBook.book.author})</option>
    {/each}
  </select>

  <pre class="fileName">{$renderedFileName}</pre>
  <pre class="file">{$renderedFile}</pre>
</div>

<style>
  .wrapper {
    width: 500px;
  }

  pre {
    white-space: pre-wrap;
    background-color: var(--background-secondary-alt);
    padding: 8px 20px;
  }

  .fileName,
  .bookSelect {
    margin-bottom: 20px;
  }
</style>
