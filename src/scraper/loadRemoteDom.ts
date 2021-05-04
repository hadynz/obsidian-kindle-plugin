import { BrowserWindow, remote } from 'electron';
import cheerio, { Root } from 'cheerio';

const { BrowserWindow: RemoteBrowserWindow } = remote;

export const loadRemoteDom = (url: string, timeout = 0): Promise<Root> => {
  return new Promise<Root>((resolve) => {
    const window: BrowserWindow = new RemoteBrowserWindow({
      width: 1000,
      height: 600,
      webPreferences: {
        webSecurity: false,
        nodeIntegration: false,
      },
      show: false,
    });

    window.webContents.on('did-finish-load', async () => {
      if (timeout > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      const html = await window.webContents.executeJavaScript(
        `document.querySelector('body').innerHTML`
      );

      const $ = cheerio.load(html);

      window.destroy();

      resolve($);
    });

    window.loadURL(url);
  });
};
