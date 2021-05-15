import sanitize from 'sanitize-filename';

export const santizeTitle = (title: string): string => {
  return santizeTitleExcess(title).replace(/[':]/g, ''); // remove single quotes from title
};

export const santizeTitleExcess = (title: string): string => {
  const santizedTitle = title
    .replace(/ *\([^)]*\) */g, '') // remove parenthesis and contents from title
    .replace(/:.*/g, ''); // remove description test after `:` in title

  return sanitize(santizedTitle);
};

export const numberWithCommas = (x: number): string => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
