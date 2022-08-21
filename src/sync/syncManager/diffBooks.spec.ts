import faker from 'faker';

import type { Book } from '~/models';

import { diffBooks } from './diffBooks';

const book = (id: string, lastAnnotatedDate?: Date): Book => {
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

  it('Books with same last annotated date on same day as last sync will always be filtered for sync', () => {
    const remoteBooks = [book('1', new Date('October 25, 2021'))];
    const vaultBooks = [book('1', new Date('October 25, 2021'))];
    const lastSyncDate = new Date('Tue Oct 25 2021 18:58:18 GMT+1300');

    const actualBooks = diffBooks(remoteBooks, vaultBooks, lastSyncDate);
    expect(actualBooks.map((a) => a.id)).toEqual(['1']);
  });

  it('Books with same last annotated date a day before last sync will always be filtered for sync', () => {
    const remoteBooks = [book('1', new Date('October 25, 2021'))];
    const vaultBooks = [book('1', new Date('October 25, 2021'))];
    const lastSyncDate = new Date('Tue Oct 26 2021 18:58:18 GMT+1300');

    const actualBooks = diffBooks(remoteBooks, vaultBooks, lastSyncDate);
    expect(actualBooks.map((a) => a.id)).toEqual(['1']);
  });

  it('Books with same last annotated date two days before last sync will not be filtered for sync', () => {
    const remoteBooks = [book('1', new Date('October 25, 2021'))];
    const vaultBooks = [book('1', new Date('October 25, 2021'))];
    const lastSyncDate = new Date('Tue Oct 27 2021 18:58:18 GMT+1300');

    const actualBooks = diffBooks(remoteBooks, vaultBooks, lastSyncDate);
    expect(actualBooks.map((a) => a.id)).toHaveLength(0);
  });

  it('Books with different last annotated dates are filtered for sync', () => {
    const remoteBooks = [book('1', new Date('October 19, 2018'))];
    const vaultBooks = [book('1', new Date('August 6, 2018'))];

    const actualBooks = diffBooks(remoteBooks, vaultBooks, new Date());
    expect(actualBooks.map((a) => a.id)).toEqual(['1']);
  });
});
