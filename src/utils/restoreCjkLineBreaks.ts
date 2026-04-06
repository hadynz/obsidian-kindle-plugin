/**
 * Restore line breaks in CJK text.
 *
 * Kindle strips original line breaks and replaces them with spaces.
 * In languages that don't typically use spaces between words,
 * a space after sentence-ending punctuation is a strong signal of an original line break.
 *
 * This is a punctuation-based heuristic only. It does not detect the actual
 * language of the input, so it may affect any CJK text that
 * uses the same punctuation patterns.
 *
 * This function detects such patterns and restores the newline character.
 */
export const restoreCjkLineBreaks = (text: string): string => {
  // Match CJK sentence-ending punctuation followed by spaces or tabs.
  // Punctuation: 。！？…」』）】
  return text.replace(/([。！？…」』）】])[ \t]+/g, '$1\n');
};
