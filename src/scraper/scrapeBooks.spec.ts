import { parseToDateString } from './scrapeBooks';

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
});
