/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly PUBLIC_URL: string;
    readonly MAPBOX_TOKEN: string;
  }
}

interface SC {
  Widget: {
    Events: any;
  };
}

declare namespace SC {
  type AnyFunction = (...args: any[]) => any;

  type SoundCloudWidget = {
    bind: (event: string, cb: AnyFunction) => void;
    play: () => void;
    load: (src: string, options: any) => void;
    pause: () => null;
  };

  const Widget = (node: Element) => ({
    bind: (event: string, cb: any) => null,
    play: () => null,
    pause: () => null,
    load: (src: string, options?: EmbedOptions) => null
  });

  Widget.Events = {
    READY: ''
  };
}

declare module '*.ttf' {
  const src: string;
  export default src;
}
declare module '*.avif' {
  const src: string;
  export default src;
}

declare module '*.bmp' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  import * as React from 'react';
  import { theme } from './styles/theme';

  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;

  export default ReactComponent;
}
