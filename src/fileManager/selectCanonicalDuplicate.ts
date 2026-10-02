export type DuplicateCandidate = {
  path: string;
  highlightsCount?: number;
  createdAt: number;
};

const hasNumericSuffix = (path: string): boolean => /-\d+\.md$/.test(path);

/**
 * Picks which of two files claiming the same bookId should be treated as canonical. Exists so
 * that even if a duplicate note ever slips back in (a leftover from a bug, a sync interrupted
 * mid-write, a manual copy), lookups stay consistent instead of depending on whatever order the
 * vault happens to enumerate files in - which otherwise lets different syncs read and write
 * different copies of the "same" book, permanently confusing anything that compares state between
 * syncs (see the lastChecked bookkeeping this exists to protect).
 *
 * Preference order: most highlights (the most complete copy), then no numeric-suffix filename
 * (the canonical name a fresh write would use), then oldest (the original, not a later copy).
 */
export const pickBetterDuplicate = <T extends DuplicateCandidate>(a: T, b: T): T => {
  const aCount = a.highlightsCount ?? -1;
  const bCount = b.highlightsCount ?? -1;

  if (aCount !== bCount) {
    return aCount > bCount ? a : b;
  }

  const aHasSuffix = hasNumericSuffix(a.path);
  const bHasSuffix = hasNumericSuffix(b.path);

  if (aHasSuffix !== bHasSuffix) {
    return aHasSuffix ? b : a;
  }

  return a.createdAt <= b.createdAt ? a : b;
};
