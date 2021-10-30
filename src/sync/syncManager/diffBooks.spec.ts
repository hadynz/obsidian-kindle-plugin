import faker from 'faker';

import { diffBooks } from './diffBooks';
import type { Book } from '~/models';

const book = (id: string, lastAnnotatedDate?: string): Book => {
  return {
    id,
    title: faker.lorem.words(3),
    author: faker.name.findName(),
    lastAnnotatedDate,
  };
};

describe('diffBooks', () => {
  it('New remote books are always filtered for sync', () => {
    const remoteBooks = [book('1'), book('2'), book('3')];
    const vaultBooks = [book('1')];

    const actualBooks = diffBooks(remoteBooks, vaultBooks, new Date());
    expect(actualBooks.map((a) => a.id)).toEqual(['2', '3']);
  });

  it('No books to sync if remote and vault are identical', () => {
    const remoteBooks = [book('1'), book('2'), book('3')];
    const vaultBooks = [book('1'), book('2'), book('3')];

    const actualBooks = diffBooks(remoteBooks, vaultBooks, new Date());
    expect(actualBooks).toHaveLength(0);
  });

  it('Books newer than last sync date are filtered for sync', () => {
    const remoteBooks = [
      book('1', 'October 24, 2021'),
      book('2', 'October 24, 2021'),
      book('3', 'November 4, 2021'),
    ];
    const vaultBooks = [
      book('1', 'October 24, 2021'),
      book('2', 'October 24, 2021'),
      book('3', 'October 24, 2021'),
    ];
    const lastSyncDate = new Date('November 2, 2021');

    const actualBooks = diffBooks(remoteBooks, vaultBooks, lastSyncDate);
    expect(actualBooks.map((a) => a.id)).toEqual(['3']);
  });

  it('Books 1 day older than last sync date is still filtered for sync', () => {
    const remoteBooks = [book('1', 'November 24, 2021')];
    const vaultBooks = [book('1', 'October 24, 2021')];
    const lastSyncDate = new Date('November 25, 2021');

    const actualBooks = diffBooks(remoteBooks, vaultBooks, lastSyncDate);
    expect(actualBooks.map((a) => a.id)).toEqual(['1']);
  });

  it('Books 1 day older than last sync date (with time) is still filtered for sync', () => {
    const remoteBooks = [book('1', 'October 25, 2021')];
    const vaultBooks = [book('1', 'October 22, 2021')];
    const lastSyncDate = new Date('Tue Oct 26 2021 18:58:18 GMT+1300');

    const actualBooks = diffBooks(remoteBooks, vaultBooks, lastSyncDate);
    expect(actualBooks.map((a) => a.id)).toEqual(['1']);
  });
});
