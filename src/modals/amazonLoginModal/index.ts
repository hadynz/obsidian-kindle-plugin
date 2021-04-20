import { remote } from 'electron';
import { PluginSettings } from 'src/settings';

const { BrowserWindow } = remote;

import { StringDecoder } from 'string_decoder';
import queryString, { ParsedQuery } from 'query-string';

export default class AmazonLoginModal {
  private modal;
  private waitForSignIn: Promise<void>;
  private resolvePromise!: () => void;

  constructor(settings: PluginSettings) {
    let userEmail = 'unknown';

    this.waitForSignIn = new Promise(
      (resolve: () => void) => (this.resolvePromise = resolve),
    );

    this.modal = new BrowserWindow({
      parent: remote.getCurrentWindow(),
      width: 450,
      height: 730,
      show: true,
    });

    // We can only change title after page is loaded since HTML page has its own title
    this.modal.once('ready-to-show', () => {
      this.modal.setTitle('Connect your Amazon account to Obsidian');
      this.modal.show();
    });

    // Intercept login to amazon to sniff out user email address to store in plugin state for display purposes
    this.modal.webContents.session.webRequest.onBeforeSendHeaders(
      { urls: ['https://www.amazon.com/ap/signin'] },
      (details, callback) => {
        const formData = decodeRequestBody(details);
        userEmail = formData.email as string;

        callback(details);
      },
    );

    // If user is on the read.amazon.com url, we can safely assume they are logged in
    this.modal.webContents.on('did-navigate', async (_event, url) => {
      if (url.startsWith('https://read.amazon.com')) {
        this.modal.close();
        await settings.login(userEmail);
        this.resolvePromise();
      }
    });
  }

  async doLogin(): Promise<void> {
    this.modal.loadURL('https://read.amazon.com/notebook');
    return this.waitForSignIn;
  }
}

const decodeRequestBody = (body: any): ParsedQuery<string> => {
  const formDataRaw = (body as any).uploadData as Iterable<unknown>;
  const formDataBuffer = (Array.from(formDataRaw)[0] as any).bytes;

  const decoder = new StringDecoder();
  const formData = decoder.write(formDataBuffer);
  return queryString.parse(formData);
};
