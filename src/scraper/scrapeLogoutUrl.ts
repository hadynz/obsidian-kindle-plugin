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

type LogoutUrl = {
  url: string;
  isStillLoggedIn: boolean;
};

const scrapeLogoutUrl = async (): Promise<LogoutUrl> => {
  const region = currentAmazonRegion();
  const kindleReaderUrl = region.kindleReaderUrl;

  const { dom, didNavigateUrl } = await loadRemoteDom(kindleReaderUrl);

  let logoutUrl: string = null;
  const isStillLoggedIn = !didNavigateUrl.contains('signin');

  if (isStillLoggedIn) {
    const signoutHrefUrl = parseSignoutLink(dom);
    logoutUrl = `${kindleReaderUrl}${signoutHrefUrl}`;
  }

  return {
    url: logoutUrl,
    isStillLoggedIn,
  };
};

export default scrapeLogoutUrl;
