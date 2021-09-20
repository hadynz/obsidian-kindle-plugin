import sanitize from 'sanitize-filename';

export const sanitizeTitle = (title: string): string => {
  return sanitizeTitleExcess(title).replace(/[':]/g, ''); // remove single quotes from title
};

export const sanitizeTitleExcess = (title: string): string => {
  const santizedTitle = title
    .replace(/ *\([^)]*\) */g, '') // remove parenthesis and contents from title
    .replace(/:.*/g, '') // remove description test after `:` in title
    .trim();

  return sanitize(santizedTitle);
};

export const br2ln = (html: string): string => {
  return html ? html.replace(/<br\s*[/]?>/gi, '\n') : html;
};
