import { readable, writable } from 'svelte/store';

import type { Book } from '~/models';

export type BookDemo = Pick<Book, 'title' | 'author'>;

export const books = readable([
  { title: 'Animal Farm (Classics To Go)', author: 'George Orwell' },
  { title: 'An Everyone Culture', author: 'Robert Kegan and Lisa Laskow Lahey' },
  { title: 'The Girl on the Train: A Novel', author: 'Paula Hawkins' },
] as BookDemo[]);

export const fileName = writable('');
