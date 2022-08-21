import { BrowserWindow, remote } from 'electron';

import { currentAmazonRegion } from '~/amazonRegion';
import type { AmazonAccount } from '~/models';
import { settingsStore } from '~/store';

const { BrowserWindow: RemoteBrowserWindow } = remote;

export default class AmazonLoginModal {
  private modal: BrowserWindow;
  private waitForSignIn: Promise<boolean>;
  private resolvePromise!: (success: boolean) => void;
  private region: AmazonAccount;

  constructor() {
    this.region = currentAmazonRegion();

    this.waitForSignIn = new Promise(
      (resolve: (success: boolean) => void) => (this.resolvePromise = resolve)
    );

    this.modal = new RemoteBrowserWindow({
      parent: remote.getCurrentWindow(),
      width: 450,
      height: 730,
      show: false,
    });

    // We can only change title after page is loaded since HTML page has its own title
    this.modal.once('ready-to-show', () => {
      this.modal.setTitle('Connect your Amazon account to Obsidian');
      this.modal.show();
    });

    // If user is on the read.amazon.com url, we can safely assume they are logged in
    this.modal.webContents.on('did-navigate', (_event, url) => {
      if (url.startsWith(this.region.kindleReaderUrl)) {
        this.modal.close();

        settingsStore.actions.login();

        this.resolvePromise(true);
      }
    });

    this.modal.on('closed', () => {
      this.resolvePromise(false);
    });
  }

  async doLogin(): Promise<boolean> {
    try {
      await this.modal.loadURL(this.region.notebookUrl);
    } catch (error) {
      // Swallow error. `loadUrl` is interrupted on successful
      // login as we immediately redirect if user is logged in
    }

    return this.waitForSignIn;
  }
}
