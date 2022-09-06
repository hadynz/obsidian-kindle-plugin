type Author = {
  firstName: string;
  lastName: string;
};

export const parseAuthors = (author: string | undefined): Author[] => {
  if (author == null) {
    return [{ firstName: undefined, lastName: undefined }];
  }

  if (new RegExp(/\b(and)+/, 'i').exec(author)) {
    return author
      .split(new RegExp(/\b(and|,)+/, 'i'))
      .map((a) => a.trim())
      .filter((a) => ['and', ',', ''].indexOf(a.toLowerCase()) === -1)
      .map(parseSingleAuthor);
  }

  if (author.includes(';')) {
    return author
      .split(';')
      .map((a) => a.trim())
      .map(parseSingleAuthor);
  }

  return [parseSingleAuthor(author)];
};

const parseSingleAuthor = (author: string): Author => {
  const hasComma = author.includes(',');

  if (hasComma) {
    const names = splitAndTrim(',', author);
    return {
      firstName: names.length == 1 ? undefined : splitAndTrim(' ', names[names.length - 1])[0],
      lastName: names[0],
    };
  }

  const names = splitAndTrim(' ', author);
  return {
    firstName: names.length == 1 ? undefined : names[0],
    lastName: names[names.length - 1],
  };
};

const splitAndTrim = (needle: string, author: string): string[] => {
  return author
    .split(needle)
    .map((a) => a.trim())
    .map((a) => a.replace(/\.$/, ''));
};
