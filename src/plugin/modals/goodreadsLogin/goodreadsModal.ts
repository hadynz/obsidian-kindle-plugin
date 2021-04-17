import { App, Modal } from 'obsidian';

import CredentialsManager from '../../CredentialsManager';
import EnterGoodreadsLogin from './enterGoodreadsLogin.svelte';
import KindleService from '../../KindleService';

export default class GoodreadsModal extends Modal {
  public waitForClose: Promise<void>;
  private resolvePromise!: () => void;
  private modalContent: EnterGoodreadsLogin;
  private credentialsManager: CredentialsManager;

  constructor(app: App, tokenManager: CredentialsManager) {
    super(app);

    this.credentialsManager = tokenManager;
    this.waitForClose = new Promise(
      (resolve) => (this.resolvePromise = resolve),
    );

    this.titleEl.innerText = 'Sign in to Goodreads';

    const kindleService = new KindleService();

    const cmp = new EnterGoodreadsLogin({
      target: this.contentEl,
      props: {
        submitting: false,
        onSubmit: async (email: string, password: string) => {
          cmp.$set({ submitting: true });

          const success = await kindleService.login();
          console.log('sucess', success);

          cmp.$set({ submitting: false });

          //this.credentialsManager.upsert({ email, password });
          //this.close();
        },
      },
    });

    this.modalContent = cmp;

    this.open();
  }

  onClose() {
    super.onClose();
    this.modalContent.$destroy();
    this.resolvePromise();
  }
}
