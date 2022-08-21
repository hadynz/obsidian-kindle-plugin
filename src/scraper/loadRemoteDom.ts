import cheerio, { Root } from 'cheerio';
import { BrowserWindow, remote } from 'electron';

const { BrowserWindow: RemoteBrowserWindow } = remote;

type DomResult = {
  dom: Root;
  didNavigateUrl: string;
  didFinishLoadUrl: string;
};

export const loadRemoteDom = async (targetUrl: string, timeout = 0): Promise<DomResult> => {
  const window: BrowserWindow = new RemoteBrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: false,
    },
    show: false,
  });

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  window.loadURL(targetUrl);

  return new Promise<DomResult>((resolveWrapper) => {
    let didNavigateUrl: string = null;

    window.webContents.on('did-navigate', (_event, url) => {
      didNavigateUrl = url;
    });

    window.webContents.on('did-finish-load', (_event, url) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      Promise.resolve()
        .then(() => {
          if (timeout > 0) {
            return new Promise((resolve) => {
              setTimeout(resolve, timeout);
            });
          }
        })
        .then(() => {
          return window.webContents.executeJavaScript(
            `document.querySelector('body').innerHTML`
          );
        })
        .then((html) => {
          const $ = cheerio.load(html);

          window.destroy();

          resolveWrapper({
            dom: $,
            didNavigateUrl: didNavigateUrl,
            didFinishLoadUrl: url as string,
          });
        });
    });
  });
};
