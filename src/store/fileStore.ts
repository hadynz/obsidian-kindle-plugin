import _ from 'lodash';
import { readable } from 'svelte/store';

import { ee } from '~/eventEmitter';
import type FileManager from '~/fileManager';

type FileStoreState = {
  fileCount: number;
  highlightCount: number;
};

const INITIAL_STATE: FileStoreState = {
  fileCount: 0,
  highlightCount: 0,
};

const createFileStore = () => {
  let _fileManager: FileManager;

  const initialize = (fileManager: FileManager): void => {
    _fileManager = fileManager;
  };

  const store = readable(INITIAL_STATE, (set) => {
    const updateFileCount = () => {
      const files = _fileManager.getKindleFiles();
      set({
        fileCount: files.length,
        highlightCount: _.sumBy(files, (file) => file.frontmatter?.highlightsCount),
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
