import { remote, BrowserWindow } from 'electron';

import type { AmazonAccount } from '~/models';
import { settingsStore } from '~/store';
import { currentAmazonRegion } from '~/amazonRegion';

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

    this.modal.on('closed', () => {
      this.resolvePromise(false);
    });

    // If user is on the read.amazon.com url, we can safely assume they are logged in
    this.modal.webContents.on('did-navigate', async (_event, url) => {
      if (url.startsWith(this.region.kindleReaderUrl)) {
        this.modal.close();

        await settingsStore.actions.login();

        this.resolvePromise(true);
      }
    });
  }

  async doLogin(): Promise<boolean> {
    this.modal.loadURL(this.region.notebookUrl);
    return this.waitForSignIn;
  }
}
