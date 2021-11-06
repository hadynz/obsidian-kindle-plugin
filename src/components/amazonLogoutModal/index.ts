import { remote, BrowserWindow } from 'electron';

import { settingsStore } from '~/store';

const { BrowserWindow } = remote;

export default class AmazonLogoutModal {
  private modal: BrowserWindow;
  private url: string;
  private waitForSignIn: Promise<void>;
  private resolvePromise!: () => void;

  constructor(url: string) {
    this.url = url;

    this.waitForSignIn = new Promise((resolve: () => void) => (this.resolvePromise = resolve));

    this.modal = new BrowserWindow({
      parent: remote.getCurrentWindow(),
      width: 450,
      height: 730,
      show: false,
    });

    this.modal.once('ready-to-show', () => {
      this.modal.show();
    });

    this.modal.webContents.on('did-navigate', async () => {
      if (url.contains('signin')) {
        this.modal.destroy();

        await settingsStore.actions.logout();

        this.resolvePromise();
      }
    });
  }

  async doLogout(): Promise<void> {
    try {
      this.modal.loadURL(this.url);
    } catch (error) {
      // Swallow error. `loadUrl` is interrupted on successful
      // logout as we immediately redirect if user is logged out
    }

    return this.waitForSignIn;
  }
}
