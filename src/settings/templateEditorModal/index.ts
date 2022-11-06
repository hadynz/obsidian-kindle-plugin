import { App, Modal as ObsidianModal } from 'obsidian';
import { get } from 'svelte/store';

import { settingsStore } from '~/store';

import Modal from './components/Modal/Modal.svelte';
import store, { TemplateEditorModalStore } from './store';

export default class TemplateEditorModal extends ObsidianModal {
  private modalContent: Modal;
  private modalStore: TemplateEditorModalStore;

  constructor(app: App) {
    super(app);
    this.modalStore = store();
  }

  public show(): void {
    this.modalContent = new Modal({
      target: this.contentEl,
      props: {
        store: this.modalStore,
        onSave: () => {
          const newFileName = get(this.modalStore.fileNameTemplateField);
          const newFileTemplateField = get(this.modalStore.fileTemplateField);
          const newHighlightTemplateField = get(this.modalStore.highlightTemplateField);

          settingsStore.actions.setFileNameTemplate(newFileName);
          settingsStore.actions.setFileTemplate(newFileTemplateField);
          settingsStore.actions.setHighlightTemplate(newHighlightTemplateField);
        },
        onClose: () => {
          // Show dialog warning to save changes if form is dirty
          this.close();
        },
      },
    });

    this.modalEl.classList.add('mod-settings', 'mod-sidebar-layout');
    this.modalEl.style.width = '85vw';
    this.modalEl.style.height = '60vw';

    this.open();
  }

  onClose(): void {
    super.onClose();
    this.modalContent.$destroy();
  }
}
