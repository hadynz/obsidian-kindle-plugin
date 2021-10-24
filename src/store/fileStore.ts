import { readable } from 'svelte/store';

import { ee } from '~/eventEmitter';
import type FileManager from '~/fileManager';

const createFileStore = () => {
  let _fileManager: FileManager;

  const initialize = (fileManager: FileManager): void => {
    _fileManager = fileManager;
  };

  const store = readable(0, (set) => {
    const updateFileCount = () => {
      _fileManager?.getKindleFiles().then((files) => {
        set(files.length);
      });
    };

    // Initial seed when Obsidian is loaded
    updateFileCount();

    ee.on('obsidianReady', updateFileCount);

    // Delay fetching of latest count to give Obsidian time to cache newly created file
    ee.on('syncBookSuccess', () => {
      window.setTimeout(updateFileCount, 500);
    });
  });

  return {
    subscribe: store.subscribe,
    initialize,
  };
};

export const fileStore = createFileStore();
