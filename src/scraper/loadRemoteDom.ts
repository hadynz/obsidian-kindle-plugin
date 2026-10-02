import cheerio, { Root } from 'cheerio';
import { BrowserWindow, remote } from 'electron';

import { ee } from '~/eventEmitter';

import type { ScrollUntilStableOptions } from './scrollUntilStable';
import { scrollUntilStable } from './scrollUntilStable';

const { BrowserWindow: RemoteBrowserWindow } = remote;

type DomResult = {
  dom: Root;
  didNavigateUrl: string;
};

type LoadRemoteDomOptions = {
  log?: boolean;
  label?: string;
  /**
   * Some pages (like Amazon's Kindle notebook library list) only render items into the DOM as
   * the page is scrolled. When set, the page is repeatedly scrolled to the bottom and `itemSelector`
   * is counted until the count stops growing, instead of just waiting out a fixed `timeout`.
   */
  scrollToLoadAll?: { itemSelector: string } & ScrollUntilStableOptions;
  /** Give up and reject if the page hasn't resolved within this many ms (default 2 minutes) */
  loadTimeoutMs?: number;
};

// Chromium's ERR_ABORTED. Fires for perfectly normal cases (a redirect that interrupts the
// original navigation, for instance) so it's not treated as a real load failure.
const ERR_ABORTED = -3;

export const loadRemoteDom = async (
  targetUrl: string,
  timeout = 0,
  options: LoadRemoteDomOptions = {}
): Promise<DomResult> => {
  const shouldLog = options.log !== false;
  const labelPrefix = options.label ? `${options.label}: ` : '';

  const window: BrowserWindow = new RemoteBrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: false,
      partition: 'persist:kindle-highlights',
    },
    show: false,
  });

  const destroyWindow = (): void => {
    if (!window.isDestroyed()) {
      window.destroy();
    }
  };

  return new Promise<DomResult>((resolveWrapper, rejectWrapper) => {
    let didNavigateUrl: string = null;
    let settled = false;
    let lastLoggedCount: number | undefined;

    const settle = (fn: () => void): void => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(safetyTimeout);
      fn();
    };

    // Without this, a network hang, a page that never fires did-finish-load, or a page load
    // error would leak this hidden window forever and hang whatever book/page was waiting on it,
    // stalling the whole sync instead of just failing that one item.
    const safetyTimeout = setTimeout(() => {
      settle(() => {
        destroyWindow();
        rejectWrapper(new Error(`${labelPrefix}Timed out loading ${targetUrl}`));
      });
    }, options.loadTimeoutMs ?? 120000);

    window.webContents.on('did-fail-load', (_event, errorCode: number, errorDescription: string) => {
      if (errorCode === ERR_ABORTED) {
        return;
      }
      settle(() => {
        destroyWindow();
        rejectWrapper(
          new Error(`${labelPrefix}Failed to load ${targetUrl}: ${errorDescription} (${errorCode})`)
        );
      });
    });

    window.webContents.on('did-navigate', (_event, url) => {
      didNavigateUrl = url;

      if (url !== targetUrl) {
        if (shouldLog) {
          ee.emit('syncLog', `${labelPrefix}Navigated to ${url}`);
        }
      }
    });

    window.webContents.on('did-finish-load', () => {
      if (shouldLog) {
        ee.emit('syncLog', `${labelPrefix}Page loaded`);
      }
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      Promise.resolve()
        .then(() => {
          if (options.scrollToLoadAll) {
            const { itemSelector, ...scrollOptions } = options.scrollToLoadAll;

            return scrollUntilStable(
              async () => {
                await window.webContents.executeJavaScript(
                  'window.scrollTo(0, document.body.scrollHeight)'
                );
              },
              async () => {
                const count: unknown = await window.webContents.executeJavaScript(
                  `document.querySelectorAll(${JSON.stringify(itemSelector)}).length`
                );
                return Number(count);
              },
              (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
              {
                ...scrollOptions,
                onProgress: (count) => {
                  // scrollUntilStable reports every attempt, including the repeated identical
                  // reads it needs to confirm the count has actually stopped growing - logging
                  // every one of those just prints the same number several times in a row with
                  // nothing visibly happening. Only log when the count actually changes.
                  if (shouldLog && count !== lastLoggedCount) {
                    ee.emit('syncLog', `${labelPrefix}Found ${count} item(s) so far…`);
                    lastLoggedCount = count;
                  }
                  scrollOptions.onProgress?.(count);
                },
              }
            );
          }

          if (timeout > 0) {
            if (shouldLog) {
              ee.emit(
                'syncLog',
                `${labelPrefix}Waiting ${Math.round(timeout / 1000)}s for content to render…`
              );
            }
            return new Promise((resolve) => {
              setTimeout(resolve, timeout);
            });
          }
        })
        .then(() => {
          if (shouldLog) {
            ee.emit('syncLog', `${labelPrefix}Extracting page content…`);
          }
          return window.webContents.executeJavaScript(
            `document.querySelector('body').innerHTML`
          );
        })
        .then((html) => {
          if (shouldLog) {
            ee.emit('syncLog', `${labelPrefix}Parsing HTML…`);
          }
          const $ = cheerio.load(html);

          settle(() => {
            destroyWindow();

            if (shouldLog) {
              ee.emit('syncLog', `${labelPrefix}Page ready`);
            }

            resolveWrapper({
              dom: $,
              didNavigateUrl: didNavigateUrl,
            });
          });
        })
        .catch((error) => {
          settle(() => {
            destroyWindow();
            rejectWrapper(error instanceof Error ? error : new Error(String(error)));
          });
        });
    });

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    window.loadURL(targetUrl);
  });
};
