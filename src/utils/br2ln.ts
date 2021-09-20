export const br2ln = (html: string): string => {
  return html ? html.replace(/<br\s*[/]?>/gi, '\n') : html;
};
