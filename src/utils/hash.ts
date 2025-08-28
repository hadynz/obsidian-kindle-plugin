import fletcher16 = require('fletcher');

export const hash = (value: string): string => {
  return fletcher16(Buffer.from(value.toLowerCase())).toString();
};
