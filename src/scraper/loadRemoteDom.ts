import { BrowserWindow, remote } from 'electron';
import cheerio, { Root } from 'cheerio';

const { BrowserWindow: RemoteBrowserWindow } = remote;

type RemoteLoadResult = {
  dom: Root;
  didNavigateUrl: string;
  didFinishLoadUrl: string;
};

export const loadRemoteDom = (targetUrl: string, timeout = 0): Promise<RemoteLoadResult> => {
  return new Promise<RemoteLoadResult>((resolve) => {
    let didNavigateUrl: string = null;

    const window: BrowserWindow = new RemoteBrowserWindow({
      width: 1000,
      height: 600,
      webPreferences: {
        webSecurity: false,
        nodeIntegration: false,
      },
      show: false,
    });

    window.webContents.on('did-navigate', async (_event, url) => {
      didNavigateUrl = url;
    });

    window.webContents.on('did-finish-load', async (_event, url) => {
      if (timeout > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      const html = await window.webContents.executeJavaScript(
        `document.querySelector('body').innerHTML`
      );

      const $ = cheerio.load(html);

      window.destroy();

      resolve({
        dom: $,
        didNavigateUrl: didNavigateUrl,
        didFinishLoadUrl: url,
      });
    });

    window.loadURL(targetUrl);
  });
};
