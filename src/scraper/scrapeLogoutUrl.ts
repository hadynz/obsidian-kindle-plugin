import type { Root } from 'cheerio';

import { loadRemoteDom } from './loadRemoteDom';
import { currentAmazonRegion } from '~/amazonRegion';

export const parseSignoutLink = ($: Root): string => {
  const signoutLinkEl = $('#settings-link-logout').attr('href');

  if (signoutLinkEl) {
    return signoutLinkEl;
  }

  throw new Error('Could not parse logout link');
};

const scrapeLogoutUrl = async (): Promise<string> => {
  const region = currentAmazonRegion();
  const url = region.kindleReaderUrl;

  const dom = await loadRemoteDom(url);

  const logoutHref = parseSignoutLink(dom);
  return `${url}${logoutHref}`;
};

export default scrapeLogoutUrl;
