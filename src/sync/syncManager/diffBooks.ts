import _ from 'lodash';
import moment from 'moment';

import type { Book } from '~/models';

const isEqual = (book1: Book, book2: Book): boolean => {
  // Match on the title-hash id, but fall back to ASIN: the id changes when
  // Amazon alters a book's title, whereas ASIN is stable. Without the fallback
  // a title drift makes the existing file miss and the book is re-created.
  return book1.id === book2.id || (book1.asin != null && book1.asin === book2.asin);
};

const isSameDate = (date1: Date | undefined, date2: Date | undefined): boolean => {
  return date1?.getTime() === date2?.getTime();
};

const updatedSince = (book: Book, lastSyncDate: Date): boolean => {
  if (book.lastAnnotatedDate != null) {
    return moment(lastSyncDate)
      .startOf('day')
      .subtract(1, 'd')
      .isSameOrBefore(book.lastAnnotatedDate);
  }
  return false;
};

export const diffBooks = (
  remoteBooks: Book[],
  vaultBooks: Book[],
  lastSyncDate: Date
): Book[] => {
  const newBooks = remoteBooks.filter((remote) => !vaultBooks.some((v) => isEqual(v, remote)));

  const diffAnnotatedDates = remoteBooks.filter((remote) =>
    vaultBooks.some(
      (v) => isEqual(v, remote) && !isSameDate(remote.lastAnnotatedDate, v.lastAnnotatedDate)
    )
  );

  const updatedBooks = remoteBooks.filter((remote) =>
    vaultBooks.some((v) => isEqual(v, remote) && updatedSince(remote, lastSyncDate))
  );

  return _.uniqBy([...newBooks, ...diffAnnotatedDates, ...updatedBooks], (book) => book.id);
};
