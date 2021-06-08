import matter from 'gray-matter';

export const frontMatter = {
  read: (text: string): Record<string, string> => {
    const { data } = matter(text);
    return data;
  },

  set: (text: string, records: Record<string, string>): string => {
    const { data, content } = matter(text);
    const newData = Object.assign({}, data, records);
    return matter.stringify(content, newData);
  },
};
