import matter from 'gray-matter';

import type { SyncFrontmatter } from '~/models';

export const frontMatter = {
  read: (text: string): { content: string; frontMatter: SyncFrontmatter } => {
    const { content, data } = matter(text);
    return { content, frontMatter: data as SyncFrontmatter };
  },

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
