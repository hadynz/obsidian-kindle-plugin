import _ from 'lodash';
import moment from 'moment';

import type { Book } from '~/models';

// Safety net: force a full recheck at least this often, in case Amazon's "last accessed" date
// ever doesn't track a real content change the way we expect (e.g. a highlight swapped out for
// another on the same day, synced from a device that behaves differently, etc).
const REFRESH_INTERVAL_DAYS = 90;

const isEqual = (book1: Book, book2: Book): boolean => {
  return book1.id === book2.id;
};

// Amazon's "last annotated date" is really a "last accessed" date - it updates whenever the
// book's notebook page is viewed, including by our own scrape. Comparing it against the date we
// last stored from a *previous* scrape means checking a book once poisons it forever: every
// subsequent sync sees "changed" (because we're the ones who changed it) and re-checks it again,
// which poisons it again. Comparing against our own `lastChecked` bookkeeping instead breaks the
// loop, since both values land on "today" at the moment we check, and only genuine outside
// activity after that point will move Amazon's date past it again.
const needsRecheck = (remote: Book, vault: Book): boolean => {
  if (vault.lastChecked == null) {
    return true;
  }

  if (remote.lastAnnotatedDate != null && moment(remote.lastAnnotatedDate).isAfter(vault.lastChecked, 'day')) {
    return true;
  }

  return moment().diff(vault.lastChecked, 'days') > REFRESH_INTERVAL_DAYS;
};

export const diffBooks = (remoteBooks: Book[], vaultBooks: Book[]): Book[] => {
  const newBooks = remoteBooks.filter((remote) => !vaultBooks.some((v) => isEqual(v, remote)));

  const booksNeedingRecheck = remoteBooks.filter((remote) =>
    vaultBooks.some((v) => isEqual(v, remote) && needsRecheck(remote, v))
  );

  return _.uniqBy([...newBooks, ...booksNeedingRecheck], (book) => book.id);
};
