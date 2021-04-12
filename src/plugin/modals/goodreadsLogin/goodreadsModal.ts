import { App, Modal } from 'obsidian';

import EnterGoodreadsLogin from './enterGoodreadsLogin.svelte';

export default class GoodreadsModal extends Modal {
  public waitForClose: Promise<void>;
  private resolvePromise!: () => void;
  private modalContent: EnterGoodreadsLogin;

  constructor(app: App) {
    super(app);

    this.waitForClose = new Promise(
      (resolve) => (this.resolvePromise = resolve),
    );

    this.titleEl.innerText = 'Setup Readwise API token';

    this.modalContent = new EnterGoodreadsLogin({
      target: this.contentEl,
      props: {
        onSubmit: (value: string) => {
          console.log('entered', value);
          this.close();
        },
      },
    });

    this.open();
  }

  onClose() {
    super.onClose();
    this.modalContent.$destroy();
    this.resolvePromise();
  }
}
