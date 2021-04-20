import { remote, Event } from 'electron';

const { BrowserWindow } = remote;

export default class AmazonLoginModal {
  private modal;
  private waitForSignIn: Promise<void>;
  private resolvePromise!: () => void;

  constructor() {
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
      this.modal.setTitle('Connect your Amazon account to Obsidian');
      this.modal.show();
    });

    // If user is on the read.amazon.com url, we can safely assume they are logged in
    this.modal.webContents.on('did-navigate', (_event: Event, url: string) => {
      if (url.startsWith('https://read.amazon.com')) {
        this.modal.close();
        this.resolvePromise();
      }
    });
  }

  async doLogin() {
    this.modal.loadURL('https://read.amazon.com/notebook');
    return this.waitForSignIn;
  }
}
