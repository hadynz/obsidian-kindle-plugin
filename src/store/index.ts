import { fileStore } from './fileStore';
import { settingsStore } from './settingsStore';
import { statusBarStore } from './statusBar';

import type KindlePlugin from '~/.';
import type FileManager from '~/fileManager';

const initializeStores = async (
  plugin: KindlePlugin,
  fileManager: FileManager
): Promise<void> => {
  await settingsStore.initialize(plugin);
  await fileStore.initialize(fileManager);
};

export { initializeStores, fileStore, settingsStore, statusBarStore };
