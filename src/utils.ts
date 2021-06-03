import sanitize from 'sanitize-filename';

export const santizeTitle = (title: string): string => {
  return santizeTitleExcess(title).replace(/[':]/g, ''); // remove single quotes from title
};

export const santizeTitleExcess = (title: string): string => {
  const santizedTitle = title
    .replace(/ *\([^)]*\) */g, '') // remove parenthesis and contents from title
    .replace(/:.*/g, '') // remove description test after `:` in title
    .trim();

  return sanitize(santizedTitle);
};
