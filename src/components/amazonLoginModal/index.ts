import queryString, { ParsedQuery } from 'query-string';
import {
  remote,
  BrowserWindow,
  OnBeforeRequestListenerDetails,
} from 'electron';
import { StringDecoder } from 'string_decoder';
import { get } from 'svelte/store';

import { settingsStore } from '~/store';

const { BrowserWindow: RemoteBrowserWindow } = remote;

export default class AmazonLoginModal {
  private modal: BrowserWindow;
  private waitForSignIn: Promise<boolean>;
  private resolvePromise!: (success: boolean) => void;

  constructor() {
    let userEmail: string;

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

    // Intercept login to amazon to sniff out user email address to store in plugin state for display purposes
    this.modal.webContents.session.webRequest.onBeforeSendHeaders(
      { urls: ['https://www.amazon.com/ap/signin'] },
      (details, callback) => {
        const formData = decodeRequestBody(details);
        userEmail = formData.email as string;

        callback(details);
      }
    );

    this.modal.on('closed', () => {
      this.resolvePromise(false);
    });

    // If user is on the read.amazon.com url, we can safely assume they are logged in
    this.modal.webContents.on('did-navigate', async (_event, url) => {
      if (url.startsWith('https://read.amazon.com')) {
        this.modal.close();

        if (!get(settingsStore).loggedInEmail) {
          await settingsStore.actions.login(userEmail);
        }

        this.resolvePromise(true);
      }
    });
  }

  async doLogin(): Promise<boolean> {
    this.modal.loadURL('https://read.amazon.com/notebook');
    return this.waitForSignIn;
  }
}

const decodeRequestBody = (body: unknown): ParsedQuery<string> => {
  const requestDetails = body as OnBeforeRequestListenerDetails;
  const formDataRaw = requestDetails.uploadData;
  const formDataBuffer = Array.from(formDataRaw)[0].bytes;

  const decoder = new StringDecoder();
  const formData = decoder.write(formDataBuffer);
  return queryString.parse(formData);
};
