/* eslint-disable  @typescript-eslint/no-explicit-any */

declare module '*.njk' {
  const content: string;
  export default content;
}

declare module '*.html' {
  const content: any;
  export default content;
}

declare module '*.svg' {
  const content: any;
  export default content;
}

declare module 'svelte-loading-spinners' {
  import { SvelteComponent } from 'svelte';

  export class Jumper extends SvelteComponent {
    color: string;
    size: string;
    duration: string;
  }
}

declare module 'fletcher' {
  const fletcher16: (buffer: Buffer) => number;
  export default fletcher16;
}

declare module '*.json' {
  const file: any;
  export default file;
}

declare module 'nunjucks-date-filter' {
  interface NunjucksDateFilter {
    (date: Date, format: string): void;
    setDefaultFormat: (format: string) => void;
  }
  const module: NunjucksDateFilter;
  export default module;
}
