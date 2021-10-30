class SetInterval {
  private key: { [key: string]: number } = {};

  public reset(fn: () => void, intervalInMs: number, key = 'default'): void {
    this.clear(key);
    this.start(fn, intervalInMs, key);
  }

  public start(fn: () => void, intervalInMs: number, key = 'default'): void {
    console.log('Checking for key', key, this.key, this.key[key]);
    if (!this.key[key]) {
      this.key[key] = window.setInterval(function () {
        fn();
        console.log('Recurring message');
      }, intervalInMs);
      console.log('setting setInterval', this.key);
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
  private key: { [key: string]: number } = {};

  public reset(fn: () => void, timeoutInMs: number, key = 'default'): void {
    this.clear(key);
    this.start(fn, timeoutInMs, key);
  }

  public start(fn: () => void, timeoutInMs: number, key = 'default'): void {
    if (!this.key[key]) {
      this.key[key] = window.setTimeout(function () {
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
