import { remote } from 'electron';
import cheerio from 'cheerio';

import { parseSignoutLink } from './parser';

const { BrowserWindow } = remote;

export default function scrapeLogoutUrl(): Promise<string> {
  return new Promise<string>((resolve) => {
    const window = new BrowserWindow({
      width: 1000,
      height: 600,
      webPreferences: {
        webSecurity: false,
        nodeIntegration: false,
      },
      show: false,
    });

    window.webContents.on('did-finish-load', async () => {
      const html = await window.webContents.executeJavaScript(
        `document.querySelector('body').innerHTML`
      );

      const $ = cheerio.load(html);

      const url = parseSignoutLink($);

      window.destroy();

      resolve(url);
    });

    window.loadURL('https://read.amazon.com/notebook');
  });
}
