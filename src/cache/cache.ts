export type CacheMemoizedOptions = {
  ttl: number;
};

export interface Cache {
  memoized<Args extends any[], T>(
    key: string,
    fn: (...args: Args) => Promise<T>,
    options: CacheMemoizedOptions,
  ): (...args: Args) => Promise<T>;
}
