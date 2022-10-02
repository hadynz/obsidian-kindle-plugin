<script lang="ts">
  import Form from './Form.svelte';
  import Preview from './Preview.svelte';

  import { currentTemplateTab } from '../../store';
</script>

<div class="vertical-tabs-container">
  <div class="vertical-tab-header">
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
  <div class="vertical-tab-content-container">
    <div class="vertical-tab-content">
      <div class="row">
        <div class="form">
          <Form />
        </div>
        <div class="preview">
          <Preview />
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .vertical-tab-header {
    flex-basis: 160px !important;
  }

  .row {
    display: flex;
  }

  .form {
    flex-grow: 1;
  }

  .preview {
    margin-left: 50px;
    overflow: hidden;
  }
</style>
