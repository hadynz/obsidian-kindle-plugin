import type { Highlight } from '~/models';

export const trimMultipleLines = (content: string): string => {
  return content.trim().replace(/(\n){3,}/, '\n\n');
};

export const generateAppLink = (bookAsin: string, highlight?: Highlight): string => {
  if (bookAsin == null) {
    return null;
  }
  if (highlight?.location != null) {
    return `kindle://book?action=open&asin=${bookAsin}&location=${highlight.location}`;
  }
  return `kindle://book?action=open&asin=${bookAsin}`;
};
