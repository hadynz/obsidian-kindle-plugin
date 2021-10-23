import { readable } from 'svelte/store';

import { ee } from '~/eventEmitter';
import type FileManager from '~/fileManager';

const createFileStore = () => {
  let _fileManager: FileManager;

  const initialize = (fileManager: FileManager): void => {
    _fileManager = fileManager;
  };

  const store = readable(0, (set) => {
    const updateFileCount = () =>
      _fileManager?.getKindleFiles().then((files) => {
        set(files.length);
      });

    // Initial seed when Obsidian is loaded
    ee.on('obsidianReady', () => updateFileCount());

    // Update file count state after every successful book sync
    ee.on('syncBookSuccess', () => {
      updateFileCount();
    });
  });

  return {
    subscribe: store.subscribe,
    initialize,
  };
};

export const fileStore = createFileStore();