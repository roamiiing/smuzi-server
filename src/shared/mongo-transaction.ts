import { MongoClient } from "mongodb";

export const withMongoTransaction = <T>(
  mongoClient: MongoClient,
  fn: () => Promise<T>,
): Promise<T> =>
  mongoClient.withSession((session) =>
    session.withTransaction(fn, { readPreference: "primary" }),
  );
