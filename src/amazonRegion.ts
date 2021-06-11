import { get } from 'svelte/store';

import type { AmazonAccount, AmazonAccountRegion } from '~/models';
import { settingsStore } from '~/store';

export const AmazonRegions: Record<AmazonAccountRegion, AmazonAccount> = {
  global: {
    name: 'Global',
    hostname: 'amazon.com',
    kindleReaderUrl: 'https://read.amazon.com',
    notebookUrl: 'https://read.amazon.com/notebook',
  },
  japan: {
    name: 'Japan',
    hostname: 'amazon.co.jp',
    kindleReaderUrl: 'https://read.amazon.co.jp',
    notebookUrl: 'https://read.amazon.co.jp/notebook',
  },
  spain: {
    name: 'Spain',
    hostname: 'amazon.es',
    kindleReaderUrl: 'https://leer.amazon.es',
    notebookUrl: 'https://leer.amazon.es/notebook',
  }
};

export const currentAmazonRegion = (): AmazonAccount => {
  const selectedRegion = get(settingsStore).amazonRegion;
  return AmazonRegions[selectedRegion];
};
