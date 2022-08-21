import { BrowserWindow, remote } from 'electron';

const { BrowserWindow: RemoteBrowserWindow } = remote;

export default class AmazonLogoutModal {
  private modal: BrowserWindow;
  private url: string;
  private waitForSignIn: Promise<void>;
  private resolvePromise!: () => void;

  constructor(targetUrl: string) {
    this.url = targetUrl;

    this.waitForSignIn = new Promise((resolve: () => void) => (this.resolvePromise = resolve));

    this.modal = new RemoteBrowserWindow({
      parent: remote.getCurrentWindow(),
      width: 450,
      height: 730,
      show: false,
    });

    this.modal.once('ready-to-show', () => {
      this.modal.show();
    });

    this.modal.webContents.on('did-navigate', (_event, url) => {
      if (url.contains('signin')) {
        this.modal.destroy();
        this.resolvePromise();
      }
    });
  }

  async doLogout(): Promise<void> {
    await this.modal.loadURL(this.url);
    return this.waitForSignIn;
  }
}
