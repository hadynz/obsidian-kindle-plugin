<script lang="ts">
  import Form from './Form.svelte';
  import Preview from './Preview.svelte';

  import { currentTemplateTab } from '../../store';
</script>

<div class="vertical-tabs-container tabs-container">
  <div class="vertical-tab-header tabs-container--left">
    <div class="vertical-tab-header-group">
      <div class="vertical-tab-header-group-title">Templates</div>
      <div class="vertical-tab-header-group-items">
        <div
          class:is-active={$currentTemplateTab == 'file-name'}
          on:click={() => currentTemplateTab.set('file-name')}
          class="vertical-tab-nav-item"
        >
          File name
        </div>
        <div
          class:is-active={$currentTemplateTab == 'file'}
          on:click={() => currentTemplateTab.set('file')}
          class="vertical-tab-nav-item"
        >
          File content
        </div>
        <div
          class:is-active={$currentTemplateTab == 'highlight'}
          on:click={() => currentTemplateTab.set('highlight')}
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
          <Form />
        </div>
        <div class="preview">
          <Preview />
        </div>
    </div>
    <div class="row-buttons">
      <button class="mod-cta">Save</button>
      <button>Cancel</button>
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
    overflow: scroll;
    display: flex;
    flex-direction: row;
  }

  .row-buttons {
    text-align: right;
    padding: 10px;
  }

  .form {
    flex-grow: 1;
  }

  .preview {
    width: 350px;
    padding: 10px;
  }
</style>
