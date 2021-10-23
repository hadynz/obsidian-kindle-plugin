import EventEmitter from 'events';
import type TypedEmitter from 'typed-emitter';

import type { Book, Highlight, SyncMode } from '~/models';
import type { KindleFile } from '~/fileManager';

interface MessageEvents {
  obsidianReady: () => void;
  login: () => void;
  loginComplete: (success: boolean) => void;
  syncStart: (mode: SyncMode) => void;
  syncSuccess: () => void;
  syncFailure: (message: string) => void;
  syncBook: (book: Book) => void;
  syncBookSuccess: (book: Book, highlights: Highlight[]) => void;
  syncBookFailure: (book: Book, message: string) => void;
  resyncBook: (file: KindleFile) => void;
  resyncComplete: (file: KindleFile, diffCount: number) => void;
  resyncFailure: (file: KindleFile, message: string) => void;
}

export const ee = new EventEmitter() as TypedEmitter<MessageEvents>;

ee.on('syncFailure', console.error);
ee.on('syncBookFailure', console.error);
ee.on('resyncFailure', console.error);
