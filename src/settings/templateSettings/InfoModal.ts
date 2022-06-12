import { App, Modal } from 'obsidian';

import AvailableVariables from './components/AvailableVariables.svelte';

export class InfoModal extends Modal {
  private modal: AvailableVariables;

  constructor(app: App) {
    super(app);
  }

  public onOpen(): void {
    const { contentEl } = this;

    this.modal = new AvailableVariables({
      target: contentEl,
    });
  }

  public onClose(): void {
    const { contentEl } = this;

    this.modal.$destroy();

    contentEl.empty();
  }
}
