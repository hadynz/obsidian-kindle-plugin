import { remote } from 'electron';

import { settingsStore } from '~/store';

const { BrowserWindow } = remote;

export default class AmazonLogoutModal {
  private modal;
  private url: string;
  private waitForSignIn: Promise<void>;
  private resolvePromise!: () => void;

  constructor(url: string) {
    this.url = url;

    this.waitForSignIn = new Promise(
      (resolve: () => void) => (this.resolvePromise = resolve),
    );

    this.modal = new BrowserWindow({
      parent: remote.getCurrentWindow(),
      width: 450,
      height: 730,
      show: false,
    });

    // We can only change title after page is loaded since HTML page has its own title
    this.modal.once('ready-to-show', () => {
      this.modal.show();
    });

    // If user is on the read.amazon.com url, we can safely assume they are logged in
    this.modal.webContents.on('did-navigate', async (_event, url) => {
      if (url.contains('signin')) {
        this.modal.close();
        await settingsStore.actions.logout();
        this.resolvePromise();
      }
    });
  }

  async doLogout(): Promise<void> {
    this.modal.loadURL(this.url);
    return this.waitForSignIn;
  }
}
