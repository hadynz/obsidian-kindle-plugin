import { remote } from 'electron';
import cheerio from 'cheerio';

import KindlePlugin from '../../KindlePlugin';

const { BrowserWindow, ipcMain } = remote;

const scrapingModal = async (plugin: KindlePlugin) => {
  const win2 = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      devTools: true,
      webSecurity: false,
      nodeIntegration: true,
    },
    show: true,
  });

  win2.webContents.on('did-finish-load', () => {
    console.log('json page was loaded successflly');
    win2.webContents.executeJavaScript(
      `require('electron').ipcRenderer.send('gpu', document.querySelector('body').innerHTML);`,
    );
  });

  win2.webContents.openDevTools();
  win2.loadURL(
    'https://www.goodreads.com/notes/21956680-make-it-stick/70559316-hady-osman?ref=abp',
  );

  ipcMain.on('gpu', (_: any, gpu: any) => {
    const $ = cheerio.load(gpu);
    console.log($('.js-readingNote'));
  });
};

export default scrapingModal;
