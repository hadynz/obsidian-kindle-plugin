import { scrollUntilStable } from './scrollUntilStable';

const noopWait = (): Promise<void> => Promise.resolve();

describe('scrollUntilStable', () => {
  it('stops as soon as the count is stable for the configured number of rounds', async () => {
    const counts = [10, 25, 40, 40, 40, 40, 999]; // extra values should never be reached
    const countItems = jest.fn<Promise<number>, []>(() => Promise.resolve(counts.shift()));
    const scrollToBottom = jest.fn<Promise<void>, []>(() => Promise.resolve());

    const result = await scrollUntilStable(scrollToBottom, countItems, noopWait, {
      stableIterations: 3,
    });

    expect(result).toBe(40);
    // Initial read (10) + scrolls (25, then three consecutive 40s to satisfy stableIterations)
    expect(countItems).toHaveBeenCalledTimes(6);
  });

  it('gives up after maxIterations even if the count is still growing', async () => {
    let n = 0;
    const countItems = jest.fn<Promise<number>, []>(() => {
      n += 10;
      return Promise.resolve(n);
    });
    const scrollToBottom = jest.fn<Promise<void>, []>(() => Promise.resolve());

    const result = await scrollUntilStable(scrollToBottom, countItems, noopWait, {
      maxIterations: 5,
      stableIterations: 100,
    });

    // Initial read + 5 scroll iterations, count never stabilizes
    expect(countItems).toHaveBeenCalledTimes(6);
    expect(result).toBe(60);
  });

  it('reports progress after every scroll attempt', async () => {
    const counts = [5, 12, 12, 12];
    const countItems = jest.fn<Promise<number>, []>(() => Promise.resolve(counts.shift()));
    const scrollToBottom = jest.fn<Promise<void>, []>(() => Promise.resolve());
    const onProgress = jest.fn<void, [number]>();

    await scrollUntilStable(scrollToBottom, countItems, noopWait, {
      stableIterations: 2,
      onProgress,
    });

    // Initial read, then one per scroll: 12 (changed), 12, 12 (two consecutive stable reads)
    expect(onProgress.mock.calls.map((call) => call[0])).toEqual([5, 12, 12, 12]);
  });

  it('never scrolls if the list is already stable on first read', async () => {
    const countItems = jest.fn<Promise<number>, []>(() => Promise.resolve(7));
    const scrollToBottom = jest.fn<Promise<void>, []>(() => Promise.resolve());

    const result = await scrollUntilStable(scrollToBottom, countItems, noopWait, {
      stableIterations: 1,
    });

    expect(result).toBe(7);
    expect(scrollToBottom).toHaveBeenCalledTimes(1);
  });
});
