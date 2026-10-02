import { pickBetterDuplicate } from './selectCanonicalDuplicate';

describe('pickBetterDuplicate', () => {
  it('prefers the file with more highlights', () => {
    const a = { path: 'Book-111.md', highlightsCount: 93, createdAt: 1 };
    const b = { path: 'Book-222.md', highlightsCount: 164, createdAt: 2 };

    expect(pickBetterDuplicate(a, b)).toBe(b);
    expect(pickBetterDuplicate(b, a)).toBe(b);
  });

  it('prefers the canonical (non-suffixed) filename when highlight counts match', () => {
    const suffixed = { path: 'Book-111.md', highlightsCount: 50, createdAt: 1 };
    const canonical = { path: 'Book.md', highlightsCount: 50, createdAt: 2 };

    expect(pickBetterDuplicate(suffixed, canonical)).toBe(canonical);
    expect(pickBetterDuplicate(canonical, suffixed)).toBe(canonical);
  });

  it('prefers the oldest file when counts match and neither (or both) has a suffix', () => {
    const older = { path: 'Book-111.md', highlightsCount: 50, createdAt: 100 };
    const newer = { path: 'Book-222.md', highlightsCount: 50, createdAt: 200 };

    expect(pickBetterDuplicate(older, newer)).toBe(older);
    expect(pickBetterDuplicate(newer, older)).toBe(older);
  });

  it('treats a missing highlightsCount as worse than any real count', () => {
    const unknown = { path: 'Book-111.md', highlightsCount: undefined, createdAt: 1 };
    const known = { path: 'Book-222.md', highlightsCount: 0, createdAt: 2 };

    expect(pickBetterDuplicate(unknown, known)).toBe(known);
  });
});
