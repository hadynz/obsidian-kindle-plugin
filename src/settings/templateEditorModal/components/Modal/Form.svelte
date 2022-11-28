<script lang="ts">
  import globalConfig from '~/globalConfig';

  import type { TemplateEditorModalStore } from '../../store';
  import type { TemplateTab } from '../../types';

  import EditControls from './EditControls.svelte';
  import SettingItem from './SettingItem.svelte';

  export let editorStore: TemplateEditorModalStore;
  export let showTips: (template: TemplateTab) => void;

  const {
    activeTab,
    fileNameTemplateField,
    fileNameTemplateFieldHasError,
    fileTemplateField,
    fileTemplateFieldHasError,
    highlightTemplateField,
    highlightTemplateFieldHasError,
  } = editorStore;
</script>

{#if $activeTab === 'file-name'}
  <SettingItem name="File name template">
    <div>
      <input
        type="text"
        bind:value={$fileNameTemplateField}
        class:error={$fileNameTemplateFieldHasError}
        placeholder={globalConfig.defaultTemplates.fileName}
        spellcheck="false"
        disabled={$fileNameTemplateField == null}
      />
      <span>.md</span>
    </div>
    <EditControls
      writableStore={fileNameTemplateField}
      defaultValue={globalConfig.defaultTemplates.fileName}
      showTipsModal={() => showTips('file-name')}
    />
  </SettingItem>
{:else if $activeTab === 'file'}
  <SettingItem
    name="File template"
    description="Template for a file of highlights. This can include YAML front matter"
  >
    <textarea
      bind:value={$fileTemplateField}
      class:error={$fileTemplateFieldHasError}
      placeholder={globalConfig.defaultTemplates.file}
      spellcheck="false"
      disabled={$fileTemplateField == null}
    />
    <EditControls
      writableStore={fileTemplateField}
      defaultValue={globalConfig.defaultTemplates.file}
      showTipsModal={() => showTips('file')}
    />
  </SettingItem>
{:else if $activeTab === 'highlight'}
  <SettingItem name="Highlight template" description="Template for an individual highlight">
    <textarea
      bind:value={$highlightTemplateField}
      class:error={$highlightTemplateFieldHasError}
      placeholder={globalConfig.defaultTemplates.highlight}
      spellcheck="false"
      disabled={$highlightTemplateField == null}
    />
    <EditControls
      writableStore={highlightTemplateField}
      defaultValue={globalConfig.defaultTemplates.highlight}
      showTipsModal={() => showTips('highlight')}
    />
  </SettingItem>
{/if}

<style>
  input {
    min-width: 300px;
  }

  textarea {
    width: 100%;
    height: 400px;
    font-size: 0.8em;
    font-family: var(--font-monospace);
    resize: vertical;
  }

  input.error,
  textarea.error {
    border: 2px solid var(--color-red);
    color: var(--color-red);
  }

  textarea:focus {
    border-color: var(--interactive-accent);
  }
</style>
