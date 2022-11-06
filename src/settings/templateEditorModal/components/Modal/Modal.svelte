<!-- svelte-ignore a11y-click-events-have-key-events -->
<script lang="ts">
  import Form from './Form.svelte';
  import Preview from './Preview.svelte';

  import type { TemplateEditorModalStore } from '../../store';

  export let store: TemplateEditorModalStore;
  export let onSave: () => void;
  export let onClose: () => void;

  const { activeTab, isDirty } = store;
</script>

<div class="vertical-tabs-container tabs-container">
  <div class="vertical-tab-header tabs-container--left">
    <div class="vertical-tab-header-group">
      <div class="vertical-tab-header-group-title">Templates</div>
      <div class="vertical-tab-header-group-items">
        <div
          class:is-active={$activeTab == 'file-name'}
          on:click={() => activeTab.set('file-name')}
          class="vertical-tab-nav-item"
        >
          File name
        </div>
        <div
          class:is-active={$activeTab == 'file'}
          on:click={() => activeTab.set('file')}
          class="vertical-tab-nav-item"
        >
          File content
        </div>
        <div
          class:is-active={$activeTab == 'highlight'}
          on:click={() => activeTab.set('highlight')}
          class="vertical-tab-nav-item"
        >
          Highlight
        </div>
      </div>
    </div>
  </div>
  <div class="vertical-tab-content-container tabs-container--right">
    <div class="vertical-tab-content row-content">
      <div class="form">
        <Form editorStore={store} />
      </div>
      <div class="preview">
        <Preview editorStore={store} />
      </div>
    </div>
    <div class="row-buttons">
      {#if !$isDirty}
        <div class="save-message">No changes to save</div>
      {/if}
      <button on:click={onSave} class="mod-cta" disabled={!$isDirty}>Save</button>
      <button on:click={onClose}>Cancel</button>
    </div>
  </div>
</div>

<style>
  .tabs-container {
    flex-grow: inherit;
  }

  .tabs-container--left {
    max-width: 180px !important;
  }

  .tabs-container--right {
    display: flex;
    flex-direction: column;
  }

  .row-content {
    flex-grow: 1;
    display: flex;
    flex-direction: row;
  }

  .row-buttons {
    padding: 10px;
    display: flex;
    justify-content: right;
    align-items: center;
    gap: 10px;
  }

  .row-buttons button[disabled] {
    opacity: 0.5;
  }

  .form {
    flex-grow: 1;
  }

  .save-message {
    font-size: 0.8em;
    color: var(--text-muted);
  }

  .preview {
    width: 350px;
    padding: 10px;
  }
</style>
