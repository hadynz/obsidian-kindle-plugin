import { Credentials } from './models';

export default class CredentialsManager {
  localStorage: any;

  constructor(localStorage?: any) {
    this.localStorage = localStorage || window.localStorage;
  }

  private get(): Credentials {
    const credentialsStr = this.localStorage.getItem('goodreads_credentials');
    return JSON.parse(credentialsStr);
  }

  tryGet(): [boolean, Credentials | null] {
    const credentials = this.get();

    if (credentials === null) {
      return [false, null];
    }

    return [true, credentials];
  }

  upsert(credentials: Credentials) {
    this.localStorage.setItem(
      'goodreads_credentials',
      JSON.stringify(credentials),
    );
  }
}
