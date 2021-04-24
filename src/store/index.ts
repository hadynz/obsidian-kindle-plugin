export { settingsStore } from './settings';
export { syncSessionStore } from './syncSession';
export { statusBarStore  } from './statusBar';
export { initialise } from './initialise';

import { santizeTitle } from '../fileManager';
import { Book } from '../models';

const moment = window.moment;

type AppState = {
  status: 'idle' | 'loading';
  statusMessage: string;
  lastSyncDate: Date | null;
  synchedBookAsins: string[];
  jobs: Book[];
  inProgress: Book | null;
  done: Book[];
};




const defaultMessage = (state: AppState): string => {
  if (state.lastSyncDate) {
    return `${state.synchedBookAsins.length} book(s) synced. Last sync ${moment(
      state.lastSyncDate,
    ).fromNow()}`;
  }
  return 'Start syncing your Kindle highlights';
};
