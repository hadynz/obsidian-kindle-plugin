export type WithRetryOptions = {
  attempts?: number;
  delayMs?: number;
};

/**
 * Retries a failing async operation with a linearly increasing delay between attempts. Exists for
 * operations reading from a cloud-synced vault (iCloud Drive, Dropbox, OneDrive, ...), where a
 * file that's been evicted locally has to be fetched on demand before it can be read - something
 * that can transiently time out or fail under heavy, rapid file I/O (e.g. syncing a large
 * library) without there being anything actually wrong with the file itself.
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  { attempts = 3, delayMs = 500 }: WithRetryOptions = {}
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
      }
    }
  }

  throw lastError;
};
