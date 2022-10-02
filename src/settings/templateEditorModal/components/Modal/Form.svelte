<script lang="ts">
  import {
    DefaultFileNameTemplate,
    DefaultFileTemplate,
    DefaultHighlightTemplate,
  } from '~/rendering';

  import {
    currentTemplateTab,
    fileNameTemplateField,
    fileTemplateField,
    highlightTemplateField,
  } from '../../store';

  import EditControls from './EditControls.svelte';
  import SettingItem from './SettingItem.svelte';
</script>

{#if $currentTemplateTab === 'file-name'}
  <SettingItem name="File name template">
    <input
      type="text"
      bind:value={$fileNameTemplateField}
      placeholder={DefaultFileNameTemplate}
      spellcheck="false"
      disabled={$fileNameTemplateField == null}
    />
    <EditControls
      writableStore={fileNameTemplateField}
      defaultValue={DefaultFileNameTemplate}
    />
  </SettingItem>
{:else if $currentTemplateTab === 'file'}
  <SettingItem
    name="File template"
    description="Template for a file of highlights. This can include YAML front matter"
  >
    <textarea
      bind:value={$fileTemplateField}
      placeholder={DefaultFileTemplate}
      spellcheck="false"
      disabled={$fileTemplateField == null}
    />
    <EditControls writableStore={fileTemplateField} defaultValue={DefaultFileTemplate} />
  </SettingItem>
{:else if $currentTemplateTab === 'highlight'}
  <SettingItem name="Highlight template" description="Template for an individual highlight">
    <textarea
      bind:value={$highlightTemplateField}
      placeholder={DefaultHighlightTemplate}
      spellcheck="false"
      disabled={$highlightTemplateField == null}
    />
    <EditControls
      writableStore={highlightTemplateField}
      defaultValue={DefaultHighlightTemplate}
    />
  </SettingItem>
{/if}

<style>
  input {
    width: 400px;
  }

  textarea {
    width: 100%;
    height: 200px;
    font-size: 0.8em;
    font-family: var(--font-monospace);
  }

  textarea:focus {
    border-color: var(--interactive-accent);
  }
</style>
