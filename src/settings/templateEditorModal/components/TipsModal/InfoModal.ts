import { App, Modal as ObsidianModal } from 'obsidian';

import type { TemplateTab } from '../../types';

import Modal from './Modal.svelte';

export class InfoModal extends ObsidianModal {
  private modal: Modal;

  constructor(app: App, private template: TemplateTab) {
    super(app);
  }

  public onOpen(): void {
    const { contentEl } = this;

    this.modal = new Modal({
      target: contentEl,
      props: {
        template: this.template,
      },
    });
  }

  public onClose(): void {
    const { contentEl } = this;

    this.modal.$destroy();

    contentEl.empty();
  }
}
