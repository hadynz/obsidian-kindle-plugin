import type KindlePlugin from '~/.';
import { settingsStore } from './settings';

export async function initialise(plugin: KindlePlugin): Promise<void> {
  await settingsStore.initialise(plugin);
}
