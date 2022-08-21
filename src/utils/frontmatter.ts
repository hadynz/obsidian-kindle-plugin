import matter from 'gray-matter';

/**
 * Remove any falsy or undefined values from nested object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sanitize = (obj: any): any => {
  return JSON.parse(
    JSON.stringify(obj, (_key, value) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return value === null ? undefined : value;
    })
  );
};

export const mergeFrontmatter = (
  textWithFrontMatter: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newFrontMatter: Record<string, any>
): string => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const cleanFrontmatter = sanitize(newFrontMatter);
  const { data, content } = matter(textWithFrontMatter);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const mergedFrontMatter = Object.assign({}, data, cleanFrontmatter);
  return matter.stringify(content, mergedFrontMatter);
};
