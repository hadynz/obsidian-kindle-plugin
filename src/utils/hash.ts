import fletcher16 from 'fletcher';

export const hash = (value: string): string => {
  return fletcher16(Buffer.from(value.toLowerCase())).toString();
};
