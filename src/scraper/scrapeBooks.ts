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
        nodeIntegration: false,
      },
      show: false,
    });

    window.webContents.on('did-finish-load', async () => {
      // Sleep for about 1s to allow time for pagination to load all books
      await new Promise((resolve) => setTimeout(resolve, 1000));

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
