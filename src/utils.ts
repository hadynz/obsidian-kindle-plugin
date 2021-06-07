import sanitize from 'sanitize-filename';
import type { YAMLSeq } from 'yaml/types';
import { parseDocument } from 'yaml';

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

export const replaceInFrontMatter = (
  text: string,
  records: Record<string, string>
): string => {
  const [empty, frontMatter] = text.split(/^---\r?$\n?/m, 2);

  // Check for valid, non-empty, properly terminated front matter
  if (empty !== '' || !frontMatter.trim() || !frontMatter.endsWith('\n')) {
    return text;
  }

  const { document, map } = parseStringAsYaml(frontMatter);

  Object.keys(records).forEach((key) => {
    const recordValue = records[key];
    map.set(key, recordValue);
  });

  return text.replace(frontMatter, document.toString());
};

const parseStringAsYaml = (text: string) => {
  const parsed = parseDocument(text);

  if (parsed.errors.length) {
    throw new Error(`Error parsing YAML: ${parsed.errors[0]}`);
  }

  return { document: parsed, map: parsed.contents as YAMLSeq };
};
