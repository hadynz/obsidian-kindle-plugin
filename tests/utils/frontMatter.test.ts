import { frontMatter } from '~/utils';

describe('Setting frontmatter', () => {
  it('Override a single, existing frontmatter value', () => {
    const yamlContent = (value: string | number) => {
      return `---
tag: source/book
bookId: ${value}
---

# Content
## Heading 1
## Heading 2
`;
    };

    const newBookId = 'ABC456';
    const fileContent = yamlContent('ABC123');
    const actual = frontMatter.set(fileContent, { bookId: newBookId });

    const expected = yamlContent(newBookId);
    expect(actual).toEqual(expected);
  });

  it('Override multiple existing frontmatter values', () => {
    const yamlContent = (value1: string | number, value2: string | number) => {
      return `---
bookName: ${value1}
tag: source/book
bookId: ${value2}
---

# Content
## Heading 1
## Heading 2
`;
    };

    const fileContent = yamlContent('My Book', 'Book1234');
    const actual = frontMatter.set(fileContent, {
      bookName: 'New Book',
      bookId: 'NewBook1234',
    });

    const expected = yamlContent('New Book', 'NewBook1234');
    expect(actual).toEqual(expected);
  });

  it('Add new frontmatter values to an existing frontmatter block', () => {
    const originalYamlContent = `---
---

# Content
## Heading 1
## Heading 2
`;

    const yamlContent = (key: string, value: string) => {
      return `---
${key}: ${value}
---

# Content
## Heading 1
## Heading 2
`;
    };

    const actual = frontMatter.set(originalYamlContent, {
      bookName: 'New Book',
    });

    const expected = yamlContent('bookName', 'New Book');
    expect(actual).toEqual(expected);
  });
});
