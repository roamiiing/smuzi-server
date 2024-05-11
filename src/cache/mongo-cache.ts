import { MongoClient } from "mongodb";
import { Cache, CacheMemoizedOptions } from "./cache";
import { withMongoTransaction } from "../shared/mongo-transaction";

type MongoCacheEntry<T> = {
  arg: string;
  value: T;
  updatedAt: string;
};

export type MongoCacheDeps = {
  mongoClient: MongoClient;
};

export class MongoCache implements Cache {
  constructor(private readonly deps: MongoCacheDeps) {}

  memoized<Args extends any[], T>(
    key: string,
    fn: (...args: Args) => Promise<T>,
    options: CacheMemoizedOptions,
  ): (...args: Args) => Promise<T> {
    const collection = this.getCollection<T>(key);

    return async (...args: Args): Promise<T> => {
      const arg = JSON.stringify(args);
      const now = Date.now();
      const nowIso = new Date(now).toISOString();

      return withMongoTransaction(this.deps.mongoClient, async () => {
        const entry = await collection.findOne({ arg: { $eq: arg } });

        if (entry) {
          const { value, updatedAt } = entry;

          if (now - new Date(updatedAt).getTime() < options.ttl) {
            return value;
          }
        }

        const value = await fn(...args);

        await collection.updateOne(
          { arg: { $eq: arg } },
          { $set: { arg, value, updatedAt: nowIso } },
          { upsert: true },
        );

        return value;
      });
    };
  }

  async setup(keys: string[]) {
    const db = this.deps.mongoClient.db();

    for (const key of keys) {
      const collectionKey = this.getKey(key);

      await db.createCollection(collectionKey);
      await db.createIndex(collectionKey, { arg: 1 }, { unique: true });
    }
  }

  private getKey(key: string): string {
    return `dbcache__${key}`;
  }

  private getCollection<T>(key: string) {
    const collectionKey = this.getKey(key);

    return this.deps.mongoClient
      .db()
      .collection<MongoCacheEntry<T>>(collectionKey);
  }
}
