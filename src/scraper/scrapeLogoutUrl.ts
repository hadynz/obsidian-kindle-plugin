import type { Root } from 'cheerio';

import { loadRemoteDom } from './loadRemoteDom';

export const parseSignoutLink = ($: Root): string => {
  const signoutLinkEl = $('#kp-notebook-head tr:last-child a').attr('href');

  if (signoutLinkEl) {
    return signoutLinkEl;
  }

  throw new Error('Could not parse logout link');
};

const scrapeLogoutUrl = async (): Promise<string> => {
  const dom = await loadRemoteDom('https://read.amazon.com/notebook');
  return parseSignoutLink(dom);
};

export default scrapeLogoutUrl;
