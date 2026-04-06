/**
 * Restore line breaks in Chinese/CJK text.
 *
 * Kindle strips original line breaks and replaces them with spaces.
 * In languages that don't typically use spaces between words (like Chinese and Japanese),
 * a space after sentence-ending punctuation is a strong signal of an original line break.
 *
 * This is a punctuation-based heuristic only. It does not detect the actual
 * language of the input, so it may also affect Japanese or other CJK text that
 * uses the same punctuation patterns.
 *
 * This function detects such patterns and restores the newline character.
 */
export const restoreChineseLineBreaks = (text: string): string => {
  // Match Chinese/CJK sentence-ending punctuation followed by spaces or tabs.
  // Punctuation: 。！？…」』）】
  return text.replace(/([。！？…」』）】])[ \t]+/g, '$1\n');
};
