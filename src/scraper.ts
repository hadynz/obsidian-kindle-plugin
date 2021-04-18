import { remote } from 'electron';
import cheerio, { Root } from 'cheerio';

import { Book } from './models';
import { parseBooks } from './parser';

const { BrowserWindow, ipcMain } = remote;

export const getListofBooks = async (): Promise<Book[]> => {
  return new Promise<Book[]>((resolve) => {
    const window = new BrowserWindow({
      width: 1000,
      height: 600,
      webPreferences: {
        webSecurity: false,
        nodeIntegration: true,
      },
      show: true,
    });

    /**
     * Everytime page finishes loading, select entire DOM and send to
     * main process for scraping
     */
    window.webContents.on('did-finish-load', () => {
      window.webContents.executeJavaScript(
        `require('electron').ipcRenderer.send('pageloaded', document.querySelector('body').innerHTML);`,
      );
    });

    window.webContents.openDevTools();

    window.loadURL('https://read.amazon.com/notebook');

    /**
     * Listens for the `pageloaded` event to parse and scrape HTML
     */
    ipcMain.on('pageloaded', (_event, html) => {
      const $ = cheerio.load(html);

      const books = parseBooks($);

      window.close();
      window.destroy();

      resolve(books);
    });
  });
};
