import { Credentials } from './models';

export default class KindleService {
  token: string;

  constructor(credentials: Credentials) {
    this.token =
      'Basic ' +
      Buffer.from(`${credentials.username}:${credentials.password}`).toString(
        'base64',
      );
  }

  async login(): Promise<boolean> {
    try {
      await fetch('http://localhost:8080/kindle/login', {
        method: 'GET',
        headers: new Headers({
          Authorization: this.token,
          'Content-Type': 'application/json',
        }),
      });

      return true;
    } catch (e) {
      return false;
    }
  }

  async getBooks(): Promise<any[]> {
    const response = await fetch('http://localhost:8080/kindle/books', {
      method: 'GET',
      headers: new Headers({
        Authorization: this.token,
        'Content-Type': 'application/json',
      }),
    });

    const data = await response.json();
    return data as any[];
  }

  async getBookHighlights(bookUrl: string): Promise<any[]> {
    const response = await fetch(
      'http://localhost:8080/kindle/books/highlights',
      {
        method: 'POST',
        headers: new Headers({
          Authorization: this.token,
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          bookUrl,
        }),
      },
    );

    const data = await response.json();
    return data as any[];
  }
}
