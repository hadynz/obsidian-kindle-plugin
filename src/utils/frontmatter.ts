import type { YAMLSeq } from 'yaml/types';
import { parseDocument } from 'yaml';

export const addOrReplaceFrontMatter = (
  text: string,
  records: Record<string, string>
): string => {
  const [empty, frontMatter] = text.split(/^---\r?$\n?/m, 2);

  // Check for valid, non-empty, properly terminated front matter
  if (empty !== '' || !frontMatter.trim() || !frontMatter.endsWith('\n')) {
    return text;
  }

  const { document, map } = parseStringAsYaml(frontMatter);
  Object.keys(records).forEach((key) => map.set(key, records[key]));

  return text.replace(frontMatter, document.toString());
};

const parseStringAsYaml = (text: string) => {
  const parsed = parseDocument(text);

  if (parsed.errors.length) {
    throw new Error(`Error parsing YAML: ${parsed.errors[0]}`);
  }

  return { document: parsed, map: parsed.contents as YAMLSeq };
};
