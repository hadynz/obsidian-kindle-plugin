const { moment } = window;

import type { StatusBarMessage } from './index';

type MessageTicker = {
  start: () => void;
  resume: () => void;
  stop: () => void;
};

const messageTicker = (
  set: (statusBar: StatusBarMessage) => void,
  lastSyncDate: Date | undefined,
  fileCount: number
): MessageTicker => {
  const intervalInMs = 1000 * 60 * 5; // 5 minute
  const timeoutInMs = 1000 * 30; // 30 seconds

  let interval: NodeJS.Timeout;
  let timeout: NodeJS.Timeout;

  const defaultStatusBar = (): StatusBarMessage => {
    const timeAgo = moment(lastSyncDate).fromNow();

    return {
      status: 'ready',
      text: `${fileCount} books synced. Last sync ${timeAgo}`,
    };
  };

  const start = () => {
    if (lastSyncDate == null) {
      return; // Do nothing...
    }

    set(defaultStatusBar());

    interval = setInterval(() => {
      set(defaultStatusBar());
    }, intervalInMs);
  };

  const resume = () => {
    timeout = setTimeout(() => start(), timeoutInMs);
  };

  const stop = () => {
    if (timeout) {
      clearTimeout(timeout);
    }

    if (interval) {
      clearInterval(interval);
    }
  };

  return {
    start,
    resume,
    stop,
  };
};

export default messageTicker;
