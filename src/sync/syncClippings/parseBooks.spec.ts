import { convertChineseDateToEnglish } from './parseBooks';

describe('convertChineseDateToEnglish', () => {
  it.each([
    [
      '2022年12月17日星期六 下午5:11:41',
      'Saturday, December 17, 2022 5:11:41 PM',
    ],
    [
      '2021年8月28日 上午1:47:38',
      'August 28, 2021 1:47:38 AM',
    ],
    [
      '2024年12月31日 星期二',
      'Tuesday, December 31, 2024',
    ],
    [
      '2024年1月1日',
      'January 1, 2024',
    ],
  ])('converts %s to %s', (input, expected) => {
    expect(convertChineseDateToEnglish(input)).toBe(expected);
  });

  it('keeps invalid month values unchanged', () => {
    const input = '2024年13月1日 星期二';
    expect(convertChineseDateToEnglish(input)).toBe(input);
  });

  it('converts multiple timestamps in the same content block', () => {
    const input = [
      'Added on 2024年2月29日星期四 下午9:08:07.',
      'Updated on 2024年3月1日 上午6:00:00.',
    ].join(' ');

    expect(convertChineseDateToEnglish(input)).toBe(
      'Added on Thursday, February 29, 2024 9:08:07 PM. Updated on March 1, 2024 6:00:00 AM.'
    );
  });

  it('leaves unrelated text untouched', () => {
    const input = 'No Chinese timestamps here.';
    expect(convertChineseDateToEnglish(input)).toBe(input);
  });
});
