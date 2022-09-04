import { parseAuthor, parseToDateString } from './scrapeBooks';

jest.mock('electron', () => ({
  BrowserWindow: {},
  remote: {},
}));

describe('parseToDateString', () => {
  it('Parses English last annotated date', () => {
    const lastAnnotatedDate = parseToDateString('Monday November 15, 2021', 'global');
    expect(lastAnnotatedDate).toEqual(new Date(2021, 10, 15));
  });

  it('Parses Japanese last annotated date', () => {
    const lastAnnotatedDate = parseToDateString('2021年11月15日 月曜日', 'japan');
    expect(lastAnnotatedDate).toEqual(new Date(2021, 10, 15));
  });

  it('Parses French last annotated date', () => {
    const lastAnnotatedDate = parseToDateString('mardi août 30, 2022', 'france');
    expect(lastAnnotatedDate).toEqual(new Date(2022, 7, 30));
  });
});

describe('parseAuthor', () => {
  it('Parses scraped author (English)', () => {
    const scrapedAuthor = parseAuthor('By: John Doe');
    expect(scrapedAuthor).toEqual('John Doe');
  });

  it('Parses scraped author (French)', () => {
    const scrapedAuthor = parseAuthor('Par: John Doe');
    expect(scrapedAuthor).toEqual('John Doe');
  });

  it('Parses scraped author without a prefix (theoretical only)', () => {
    const scrapedAuthor = parseAuthor('John Doe');
    expect(scrapedAuthor).toEqual('John Doe');
  });
});
