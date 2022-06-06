<script lang="ts">
  import { books, fileName, BookDemo } from '../store';

  let selectedBook = $books[0];

  export let onSelect: (book: BookDemo) => void;
  $: onSelect(selectedBook);
</script>

<div class="wrapper">
  <div class="title">Live preview</div>
  <select class="dropdown" bind:value={selectedBook}>
    {#each $books as book}
      <option value={book}>{book.title} ({book.author})</option>
    {/each}
  </select>
  <div class="preview">Example file name: <span class="file-name">{$fileName}</span></div>
</div>

<style>
  .wrapper {
    border: 1px solid var(--background-modifier-border);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-top: 20px;
    padding: 5px 10px;
  }

  .title,
  .preview {
    color: var(--text-muted);
  }

  .preview {
    margin-top: 4px;
  }

  .file-name {
    color: var(--text-normal);
  }

  .title,
  .preview,
  .dropdown {
    font-size: 0.8em;
  }
</style>
