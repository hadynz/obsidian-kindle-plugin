import sanitize from 'sanitize-filename';

export const santizeTitle = (title: string): string => {
  const santizedTitle = title
    .replace(/ *\([^)]*\) */g, '') // remove parenthesis and contents from title
    .replace(/:.*/g, '') // remove description test after `:` in title
    .replace(/[':]/g, ''); // remove single quotes from title

  return sanitize(santizedTitle);
};
