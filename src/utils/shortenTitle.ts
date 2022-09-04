export const shortenTitle = (title: string): string => {
  return title
    .replace(/ *\([^)]*\) */g, '') // remove parenthesis and contents from title
    .replace(/:([^:]*)$/g, '') // remove text after last colon
    .replace(/[']/g, '') // remove single quotes from title
    .replace('[', '(') // replace [ with (
    .replace(']', ')') // replace ] with )
    .trim();
};
