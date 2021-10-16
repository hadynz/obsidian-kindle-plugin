import { App, Modal, Setting } from 'obsidian';

import type { Book } from '~/models';
import { sanitizeTitle } from '~/utils';

type ResyncBookCommand = 'resync' | 'skip';

export class ResyncBookModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  public async show(book: Book): Promise<ResyncBookCommand> {
    return new Promise((resolve) => {
      const { contentEl, modalEl } = this;

      const bookTitle = sanitizeTitle(book.title);

      contentEl.createEl('p', {
        text: `"${bookTitle}" already exists in your vault. What would you like to do?`,
      });

      const buttonContainerEl = modalEl.createDiv('modal-button-container');

      new Setting(buttonContainerEl)
        .addButton((btn) =>
          btn.setButtonText('Skip').onClick(() => {
            resolve('skip');
            this.close();
          })
        )
        .addButton((btn) =>
          btn
            .setButtonText('Resync')
            .setCta()
            .onClick(() => {
              resolve('resync');
              this.close();
            })
        );

      this.open();
    });
  }

  public onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }
}
