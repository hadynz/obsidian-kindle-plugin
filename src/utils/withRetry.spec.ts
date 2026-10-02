import { withRetry } from './withRetry';

describe('withRetry', () => {
  it('returns the result on the first success without retrying', async () => {
    const fn = jest.fn<Promise<string>, []>(() => Promise.resolve('ok'));

    const result = await withRetry(fn, { delayMs: 0 });

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries after a failure and returns the eventual success', async () => {
    let calls = 0;
    const fn = jest.fn<Promise<string>, []>(() => {
      calls++;
      if (calls < 3) {
        return Promise.reject(new Error('ETIMEDOUT'));
      }
      return Promise.resolve('ok');
    });

    const result = await withRetry(fn, { attempts: 3, delayMs: 0 });

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('throws the last error once all attempts are exhausted', async () => {
    const fn = jest.fn<Promise<string>, []>(() => Promise.reject(new Error('still failing')));

    await expect(withRetry(fn, { attempts: 2, delayMs: 0 })).rejects.toThrow('still failing');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
