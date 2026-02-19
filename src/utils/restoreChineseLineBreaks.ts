/**
 * Restore line breaks in Chinese/CJK text.
 *
 * Kindle strips original line breaks and replaces them with spaces.
 * In languages that don't typically use spaces between words (like Chinese and Japanese),
 * a space after sentence-ending punctuation is a strong signal of an original line break.
 *
 * This function detects such patterns and restores the newline character.
 */
export const restoreChineseLineBreaks = (text: string): string => {
	// Match Chinese/CJK sentence-ending punctuation followed by one or more spaces
	// Punctuation: 。！？…」』）】
	return text.replace(/([。！？…」』）】])\s+/g, '$1\n');
};
