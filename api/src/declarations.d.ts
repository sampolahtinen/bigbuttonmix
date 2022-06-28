declare module 'redis' {
  function createClient(p: any): RedisClient;
  export interface RedisClient extends NodeJS.EventEmitter {
    setAsync(key: string, value: string): Promise<void>;
    getAsync(key: string): Promise<string>;
    delAsync(key: string): Promise<any>;
  }
}
