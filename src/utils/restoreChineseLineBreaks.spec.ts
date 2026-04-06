import { restoreChineseLineBreaks } from './restoreChineseLineBreaks';

describe('restoreChineseLineBreaks', () => {
  it('should restore a newline when a space follows a Chinese period', () => {
    const input = '这是一个句子。 下一个句子';
    const expected = '这是一个句子。\n下一个句子';
    expect(restoreChineseLineBreaks(input)).toBe(expected);
  });

  it('should restore a newline when a space follows other Chinese punctuation', () => {
    expect(restoreChineseLineBreaks('真的吗？ 真的')).toBe('真的吗？\n真的');
    expect(restoreChineseLineBreaks('太好了！ 是的')).toBe('太好了！\n是的');
    expect(restoreChineseLineBreaks('…… 下一段')).toBe('……\n下一段');
    expect(restoreChineseLineBreaks('「引文」 结束')).toBe('「引文」\n结束');
    expect(restoreChineseLineBreaks('（备注） 更多')).toBe('（备注）\n更多');
  });

  it('should handle multiple spaces by replacing them with a single newline', () => {
    const input = '这是一个句子。    下一个句子';
    const expected = '这是一个句子。\n下一个句子';
    expect(restoreChineseLineBreaks(input)).toBe(expected);
  });

  it('should not change text without matching punctuation and space', () => {
    const input = '这是一个句子。下一个句子';
    expect(restoreChineseLineBreaks(input)).toBe(input);
  });

  it('should preserve existing line breaks after punctuation', () => {
    const input = '这是一个句子。\n下一个句子';
    expect(restoreChineseLineBreaks(input)).toBe(input);
  });

  it('should not affect English text or non-sentence-ending spaces', () => {
    const input = 'This is a sentence. Next sentence';
    expect(restoreChineseLineBreaks(input)).toBe(input);

    const chineseInput = '中间有 空格 的中文';
    expect(restoreChineseLineBreaks(chineseInput)).toBe(chineseInput);
  });

  it('should handle mixed content correctly', () => {
    const input = '中文句子。 English sentence. 又是中文！ 结束';
    const expected = '中文句子。\nEnglish sentence. 又是中文！\n结束';
    expect(restoreChineseLineBreaks(input)).toBe(expected);
  });

  it('should handle Japanese text similarly', () => {
    const input = '这是中文。 次の文';
    const expected = '这是中文。\n次の文';
    expect(restoreChineseLineBreaks(input)).toBe(expected);
  });

  it('should handle edge cases', () => {
    expect(restoreChineseLineBreaks('')).toBe('');
    expect(restoreChineseLineBreaks('   ')).toBe('   ');
  });
});
