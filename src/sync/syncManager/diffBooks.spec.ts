import faker from 'faker';
import moment from 'moment';

import type { Book } from '~/models';

import { diffBooks } from './diffBooks';

const book = (id: string, lastAnnotatedDate?: Date, lastChecked?: Date): Book => {
  return {
    id,
    title: faker.lorem.words(3),
    author: faker.name.findName(),
    lastAnnotatedDate,
    lastChecked,
  };
};

describe('diffBooks', () => {
  it('New remote books are always filtered for sync', () => {
    const remoteBooks = [book('1'), book('2'), book('3')];
    const vaultBooks = [book('1', undefined, new Date())];

    const actualBooks = diffBooks(remoteBooks, vaultBooks);
    expect(actualBooks.map((a) => a.id)).toEqual(['2', '3']);
  });

  it('No books to sync if remote and vault are identical and were checked today', () => {
    const today = new Date();
    const remoteBooks = [book('1', today), book('2', today), book('3', today)];
    const vaultBooks = [book('1', today, today), book('2', today, today), book('3', today, today)];

    const actualBooks = diffBooks(remoteBooks, vaultBooks);
    expect(actualBooks).toHaveLength(0);
  });

  it('A vault book that has never been checked (lastChecked unset) is always synced', () => {
    const remoteBooks = [book('1', new Date('October 19, 2018'))];
    const vaultBooks = [book('1', new Date('October 19, 2018'), undefined)];

    const actualBooks = diffBooks(remoteBooks, vaultBooks);
    expect(actualBooks.map((a) => a.id)).toEqual(['1']);
  });

  it("Amazon's date moving past our last check means new activity happened and we resync", () => {
    const remoteBooks = [book('1', new Date('October 25, 2021'))];
    const vaultBooks = [book('1', new Date('October 20, 2021'), new Date('October 20, 2021'))];

    const actualBooks = diffBooks(remoteBooks, vaultBooks);
    expect(actualBooks.map((a) => a.id)).toEqual(['1']);
  });

  it("Amazon's date matching our own last check (e.g. from us checking it) does not force a resync", () => {
    // Simulates the exact trap this logic exists to avoid: our own check of the book bumped
    // Amazon's "last accessed" date to the same day we recorded as lastChecked. That must not,
    // by itself, look like new activity on the next sync. Uses "now" (rather than a fixed past
    // date) so this test isn't also tripping the 90-day safety net below.
    const checkedOn = new Date();
    const remoteBooks = [book('1', checkedOn)];
    const vaultBooks = [book('1', checkedOn, checkedOn)];

    const actualBooks = diffBooks(remoteBooks, vaultBooks);
    expect(actualBooks).toHaveLength(0);
  });

  it('A book untouched on Amazon since well before our last check is not resynced', () => {
    const remoteBooks = [book('1', new Date('August 6, 2018'))];
    const vaultBooks = [book('1', new Date('August 6, 2018'), new Date())];

    const actualBooks = diffBooks(remoteBooks, vaultBooks);
    expect(actualBooks).toHaveLength(0);
  });

  it('Forces a recheck once more than 90 days have passed since we last checked, even with no new Amazon activity', () => {
    const longAgo = moment().subtract(91, 'days').toDate();
    const remoteBooks = [book('1', longAgo)];
    const vaultBooks = [book('1', longAgo, longAgo)];

    const actualBooks = diffBooks(remoteBooks, vaultBooks);
    expect(actualBooks.map((a) => a.id)).toEqual(['1']);
  });

  it('Does not force a recheck before the 90-day safety net elapses', () => {
    const recently = moment().subtract(89, 'days').toDate();
    const remoteBooks = [book('1', recently)];
    const vaultBooks = [book('1', recently, recently)];

    const actualBooks = diffBooks(remoteBooks, vaultBooks);
    expect(actualBooks).toHaveLength(0);
  });
});
