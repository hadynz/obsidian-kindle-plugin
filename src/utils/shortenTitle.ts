import sanitize from 'sanitize-filename';

export const shortenTitle = (title: string): string => {
  return sanitizeTitleExcess(title).replace(/[':]/g, ''); // remove single quotes from title
};

const sanitizeTitleExcess = (title: string): string => {
  const santizedTitle = title
    .replace(/ *\([^)]*\) */g, '') // remove parenthesis and contents from title
    .replace(/:.*/g, '') // remove description test after `:` in title
    .trim();

  return sanitize(santizedTitle);
};
