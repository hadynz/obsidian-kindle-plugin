import matter from 'gray-matter';

export const mergeFrontmatter = (
  textWithFrontMatter: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newFrontMatter: Record<string, any>
): string => {
  const { data, content } = matter(textWithFrontMatter);
  const mergedFrontMatter = Object.assign({}, data, newFrontMatter);
  return matter.stringify(content, mergedFrontMatter);
};
