import { App, Modal, Setting } from 'obsidian';

import type { Book } from '~/models';
import { sanitizeTitle } from '~/utils';

type OverwriteFileCommand = 'overwrite' | 'skip';

export class OverwriteFileModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  public async show(book: Book): Promise<OverwriteFileCommand> {
    return new Promise((resolve) => {
      const { contentEl, modalEl } = this;

      const bookTitle = sanitizeTitle(book.title);

      contentEl.createEl('p', {
        text: `A file with the same name ${bookTitle} already exists. What would you like to do?`,
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
            .setButtonText('Overwrite')
            .setCta()
            .onClick(() => {
              resolve('overwrite');
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
