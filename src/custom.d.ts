declare module '*.njk' {
  const content: any;
  export default content;
}

declare module 'svelte-loading-spinners' {
  export interface Jumper {
    color: string;
    size: string;
    duration: string;
  }
}
