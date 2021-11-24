import { mapTextToColor } from './scrapeBookHighlights';

jest.mock('electron', () => ({
  BrowserWindow: {},
  remote: {},
}));

describe('mapTextToColor', () => {
  it('handles undefined values', () => {
    expect(() => {
      mapTextToColor(undefined);
    }).not.toThrow();
  });

  it('returns null when no color found', () => {
    const actualColor = mapTextToColor('no-supported-color');
    expect(actualColor).toEqual(null);
  });

  describe('parses highlight colors correctly', () => {
    const dataset = [
      [
        'yellow',
        'a-row kp-notebook-highlight kp-notebook-selectable kp-notebook-highlight-yellow',
      ],
      [
        'blue',
        'a-row kp-notebook-highlight kp-notebook-selectable kp-notebook-highlight-blue',
      ],
      [
        'pink',
        'a-row kp-notebook-highlight kp-notebook-selectable kp-notebook-highlight-pink',
      ],
      [
        'orange',
        'a-row kp-notebook-highlight kp-notebook-selectable kp-notebook-highlight-orange',
      ],
    ];

    it.each(dataset)('parses %s highlights', (expectedColor, className) => {
      const actualColor = mapTextToColor(className);
      expect(actualColor).toEqual(expectedColor);
    });
  });
});
