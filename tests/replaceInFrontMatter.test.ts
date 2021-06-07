import { replaceInFrontMatter } from '~/utils';

const sampleYamlContent = (value: string | number) => {
  return `---
bookId: ${value}
---

# Content
## Heading 1
## Heading 2
`;
};

describe('Replacing front matter data', () => {
  it.only('strip book description in title after colon', () => {
    const fileContent = sampleYamlContent(456);
    const actual = replaceInFrontMatter(fileContent, { bookId: '500' });
    console.log(actual);

    const expected = sampleYamlContent(500);
    expect(actual).toEqual(expected);
  });
});
