declare namespace Redis {
  export interface Commands {
    get: (arg1: string) => Promise<string>;
  }
}
