export type ScrollUntilStableOptions = {
  /** Give up after this many scroll attempts, even if the count is still growing */
  maxIterations?: number;
  /** How long to wait after each scroll for lazily-loaded content to render */
  scrollDelayMs?: number;
  /** How many consecutive unchanged counts before we consider the list fully loaded */
  stableIterations?: number;
  /** Called after each scroll attempt with the item count seen so far */
  onProgress?: (count: number) => void;
};

/**
 * Repeatedly scrolls a lazily-loaded list and counts its items until the count stops growing
 * (or `maxIterations` is reached), then returns the final count. Amazon's Kindle notebook page
 * only renders books into the DOM as the page is scrolled, so a single unscrolled read only
 * ever sees the first batch.
 *
 * Scroll/count/wait are injected so this can be unit tested without a real browser.
 */
export const scrollUntilStable = async (
  scrollToBottom: () => Promise<void>,
  countItems: () => Promise<number>,
  wait: (ms: number) => Promise<void>,
  options: ScrollUntilStableOptions = {}
): Promise<number> => {
  const { maxIterations = 60, scrollDelayMs = 1000, stableIterations = 3, onProgress } = options;

  let lastCount = await countItems();
  onProgress?.(lastCount);

  let stableRounds = 0;

  for (let i = 0; i < maxIterations && stableRounds < stableIterations; i++) {
    await scrollToBottom();
    await wait(scrollDelayMs);

    const count = await countItems();
    onProgress?.(count);

    stableRounds = count === lastCount ? stableRounds + 1 : 0;
    lastCount = count;
  }

  return lastCount;
};
