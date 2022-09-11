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

    this.modalEl.style.minWidth = '80vw';

    this.el

    this.open();
  }

  onClose(): void {
    super.onClose();
    this.modalContent.$destroy();
  }
}
