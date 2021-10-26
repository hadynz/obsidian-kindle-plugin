import moment from 'moment';
import type { Book } from '~/models';

const isEqual = (book1: Book, book2: Book): boolean => {
  return book1.id === book2.id;
};

const updatedSince = (book: Book, lastSyncDate: Date): boolean => {
  if (book.lastAnnotatedDate != null) {
    return moment(lastSyncDate)
      .startOf('day')
      .subtract(1, 'd')
      .isSameOrBefore(moment(book.lastAnnotatedDate, 'MMM DD, YYYY'));
  }
  return false;
};

export const diffBooks = (
  remoteBooks: Book[],
  vaultBooks: Book[],
  lastSyncDate: Date
): Book[] => {
  const newBooks = remoteBooks.filter((remote) => !vaultBooks.some((v) => isEqual(v, remote)));

  const updatedBooks = remoteBooks.filter((remote) =>
    vaultBooks.some((v) => isEqual(v, remote) && updatedSince(remote, lastSyncDate))
  );

  return [...newBooks, ...updatedBooks];
};
