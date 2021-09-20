import matter from 'gray-matter';

export const frontMatter = {
  override: (
    textWithFrontMatter: string,
    newFrontMatter: Record<string, any>
  ): string => {
    const { data, content } = matter(textWithFrontMatter);
    const mergedFrontMatter = Object.assign({}, data, newFrontMatter);
    return matter.stringify(content, mergedFrontMatter);
  },

  stringify: (content: string, frontMatter: Record<string, any>): string => {
    return matter.stringify(content, frontMatter);
  },
};
