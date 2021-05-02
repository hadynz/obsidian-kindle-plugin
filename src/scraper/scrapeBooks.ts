import { remote } from 'electron';
import cheerio from 'cheerio';

import type { Book } from '../models';
import { parseBooks } from './parser';

const { BrowserWindow } = remote;

export default function scrapeBooks(): Promise<Book[]> {
  return new Promise<Book[]>((resolve) => {
    const window = new BrowserWindow({
      width: 1000,
      height: 600,
      webPreferences: {
        webSecurity: false,
        nodeIntegration: true,
      },
      show: false,
    });

    window.webContents.on('did-finish-load', async () => {
      const html = await window.webContents.executeJavaScript(
        `document.querySelector('body').innerHTML`
      );

      const $ = cheerio.load(html);
      const books = parseBooks($);

      window.destroy();

      resolve(books);
    });

    window.loadURL('https://read.amazon.com/notebook');
  });
}
