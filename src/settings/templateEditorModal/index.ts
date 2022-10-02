import { App, Modal as ObsidianModal } from 'obsidian';

import Modal from './components/Modal/Modal.svelte';

export default class TemplateEditorModal extends ObsidianModal {
  private modalContent: Modal;

  constructor(app: App) {
    super(app);
  }

  public show(): void {
    this.modalContent = new Modal({
      target: this.contentEl,
      props: {},
    });

    this.modalEl.classList.add('mod-settings');
    this.modalEl.style.width = '90vw';
    this.modalEl.style.height = '60vw';

    this.open();
  }

  onClose(): void {
    super.onClose();
    this.modalContent.$destroy();
  }
}
