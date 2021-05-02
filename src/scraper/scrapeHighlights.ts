import { remote } from 'electron';
import cheerio from 'cheerio';

import type { Book, Highlight } from '../models';
import { parseHighlights } from './parser';

const { BrowserWindow } = remote;

export default function scrapeHighlightsForBook(
  book: Book
): Promise<Highlight[]> {
  return new Promise<Highlight[]>((resolve) => {
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
      const highlights = parseHighlights($);

      window.destroy();

      resolve(highlights);
    });

    window.loadURL(
      `https://read.amazon.com/notebook?asin=${book.asin}&contentLimitState=&`
    );
  });
}
