declare module '*.module.css' {
  const styles: {
    [key: string]: string
  };
  export default styles;
}


declare module '*.css' {
  const css: string;
  export default css;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module JSX {
  // type Element = string;
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

