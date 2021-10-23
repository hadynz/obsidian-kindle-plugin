class SetInterval {
  private key: { [key: string]: NodeJS.Timer } = {};

  public reset(fn: () => void, intervalInMs: number, key = 'default'): void {
    this.clear(key);
    this.start(fn, intervalInMs, key);
  }

  public start(fn: () => void, intervalInMs: number, key = 'default'): void {
    if (!this.key[key]) {
      this.key[key] = setInterval(function () {
        fn();
      }, intervalInMs);
    }
  }

  public clear(key = 'default'): void {
    if (this.key[key]) {
      clearInterval(this.key[key]);
      delete this.key[key];
    }
  }
}

class SetTimeout {
  private key: { [key: string]: NodeJS.Timeout } = {};

  public reset(fn: () => void, timeoutInMs: number, key = 'default'): void {
    this.clear(key);
    this.start(fn, timeoutInMs, key);
  }

  public start(fn: () => void, timeoutInMs: number, key = 'default'): void {
    if (!this.key[key]) {
      this.key[key] = setTimeout(function () {
        fn();
      }, timeoutInMs);
    }
  }

  public clear(key = 'default'): void {
    if (this.key[key]) {
      clearTimeout(this.key[key]);
      delete this.key[key];
    }
  }
}

export { SetInterval, SetTimeout };
