import matter from 'gray-matter';

/**
 * Remove any falsy or undefined values from nested object
 */
const sanitize = (obj) => {
  return JSON.parse(
    JSON.stringify(obj, (_key, value) => {
      return value === null ? undefined : value;
    })
  );
};

export const mergeFrontmatter = (
  textWithFrontMatter: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newFrontMatter: Record<string, any>
): string => {
  const cleanFrontmatter = sanitize(newFrontMatter);
  const { data, content } = matter(textWithFrontMatter);
  const mergedFrontMatter = Object.assign({}, data, cleanFrontmatter);
  return matter.stringify(content, mergedFrontMatter);
};
