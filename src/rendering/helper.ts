export const trimMultipleLines = (content: string): string => {
  return content.trim().replace(/(\n){3,}/, '\n\n');
};
