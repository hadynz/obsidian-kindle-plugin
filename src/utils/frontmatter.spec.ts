import { mergeFrontmatter } from '~/utils';

describe('Setting frontmatter', () => {
  it('Merge a single, existing frontmatter value', () => {
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
    const actual = mergeFrontmatter(fileContent, { bookId: newBookId });

    const expected = yamlContent(newBookId);
    expect(actual).toEqual(expected);
  });

  it('Merge multiple existing frontmatter values', () => {
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
    const actual = mergeFrontmatter(fileContent, {
      bookName: 'New Book',
      bookId: 'NewBook1234',
    });

    const expected = yamlContent('New Book', 'NewBook1234');
    expect(actual).toEqual(expected);
  });

  it('Add new frontmatter values to an existing empty frontmatter block', () => {
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

    const actual = mergeFrontmatter(originalYamlContent, {
      bookName: 'New Book',
    });

    const expected = yamlContent('bookName', 'New Book');
    expect(actual).toEqual(expected);
  });

  it('Insert new frontmatter to string without any frontmatter', () => {
    const originalYamlContent = `# Content
## Heading 1
## Heading 2
`;

    const expectedYamlContent = `---
bookName: New Book
---
# Content
## Heading 1
## Heading 2
`;

    const actual = mergeFrontmatter(originalYamlContent, {
      bookName: 'New Book',
    });

    expect(actual).toEqual(expectedYamlContent);
  });

  it('Frontmatter with undefined values does not throw exception', () => {
    expect(() => {
      mergeFrontmatter('', {
        'kindle-sync': {
          lastAnnotatedDate: undefined,
        },
      });
    }).not.toThrow();
  });
});
