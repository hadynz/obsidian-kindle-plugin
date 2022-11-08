import { remote } from 'electron';
import { App, Modal as ObsidianModal } from 'obsidian';
import { get } from 'svelte/store';

import { settingsStore } from '~/store';

import Modal from './components/Modal/Modal.svelte';
import { InfoModal } from './components/TipsModal/InfoModal';
import store, { TemplateEditorModalStore } from './store';
import type { TemplateTab } from './types';

const { dialog } = remote;

const showUnsavedChangesWarningDialog = async () => {
  const result = await dialog.showMessageBox(remote.getCurrentWindow(), {
    title: 'Unsaved changes',
    message:
      'Are you sure you want to close the template editor without saving? Your changes will be lost.',
    type: 'warning',
    buttons: ['Discard', 'Cancel'],
  });

  return result.response === 0 ? 'discard' : 'cancel';
};

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
        showTips: (template: TemplateTab) => {
          new InfoModal(this.app, template).open();
        },
        onSave: () => {
          const newFileName = get(this.modalStore.fileNameTemplateField);
          const newFileTemplateField = get(this.modalStore.fileTemplateField);
          const newHighlightTemplateField = get(this.modalStore.highlightTemplateField);

          settingsStore.actions.setFileNameTemplate(newFileName);
          settingsStore.actions.setFileTemplate(newFileTemplateField);
          settingsStore.actions.setHighlightTemplate(newHighlightTemplateField);

          // Show success message
        },
        onClose: async () => {
          const isDirty = get(this.modalStore.isDirty);

          if (isDirty) {
            const result = await showUnsavedChangesWarningDialog();
            if (result === 'cancel') {
              return;
            }
          }

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
