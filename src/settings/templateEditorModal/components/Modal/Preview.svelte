<script lang="ts">
  import type { TemplateEditorModalStore } from '../../store';

  export let editorStore: TemplateEditorModalStore;

  const { demoBooks, renderedFileName, renderedFile, selectedBook } = editorStore;
</script>

<div class="wrapper">
  <div class="section section--preview">
    <h3>Live Preview</h3>
    <div class="text">Select a sample book</div>
    <select class="dropdown" bind:value={$selectedBook}>
      {#each $demoBooks as demoBook}
        <option value={demoBook}>{demoBook.book.title} ({demoBook.book.author})</option>
      {/each}
    </select>
  </div>
  <div class="section">
    <div class="text label">File name</div>
    <pre>{$renderedFileName}</pre>

    <div class="text label">File markup</div>
    <pre>{$renderedFile}</pre>
  </div>
</div>

<style>
  .wrapper {
    border-radius: var(--radius-m);
    border: 1px solid var(--background-modifier-border);
    background-color: var(--background-primary);
    overflow: hidden;
  }

  .wrapper *:last-child {
    margin-bottom: 0;
  }

  .section {
    padding: var(--size-4-3);
  }

  .section--preview {
    background-color: var(--background-secondary);
  }

  h3 {
    margin: 0;
  }

  pre {
    white-space: pre-wrap;
    background-color: var(--background-secondary-alt);
    padding: 6px 10px;
    margin-top: 0;
    font-size: 0.8em;
  }

  h3,
  pre,
  .dropdown {
    margin-bottom: 12px;
  }

  .text {
    font-size: 0.8em;
  }

  .label {
    color: var(--text-muted);
  }
</style>
