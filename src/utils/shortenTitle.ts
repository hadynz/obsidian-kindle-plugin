export const shortenTitle = (title: string): string => {
  return title
    .replace(/ *\([^)]*\) */g, '') // remove parenthesis and contents from title
    .replace(/:.*/g, '') // remove description test after `:` in title
    .replace(/[':]/g, '') // remove single quotes from title
    .trim();
};
