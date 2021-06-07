import { addOrReplaceFrontMatter } from '~/utils';

const sampleYamlContent = (value: string | number) => {
  return `---
some: "value"
bookId: "${value}"
---

# Content
## Heading 1
## Heading 2
`;
};

describe('Replacing front matter data', () => {
  it.only('strip book description in title after colon', () => {
    const fileContent = sampleYamlContent(456);
    const actual = addOrReplaceFrontMatter(fileContent, { hello: 'world' });
    console.log(actual);

    const expected = sampleYamlContent("500");
    expect(actual).toEqual(expected);
  });
});
