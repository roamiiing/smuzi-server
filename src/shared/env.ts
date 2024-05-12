if (!process.env.MONGODB_CONNECTION_STRING)
  throw new Error("MONGODB_CONNECTION_STRING environment variable is not set");

if (!process.env.POSTGRESQL_CONNECTION_STRING)
  throw new Error(
    "POSTGRESQL_CONNECTION_STRING environment variable is not set",
  );

if (!process.env.REDIS_CONNECTION_STRING)
  throw new Error("REDIS_CONNECTION_STRING environment variable is not set");

export const {
  MONGODB_CONNECTION_STRING,
  POSTGRESQL_CONNECTION_STRING,
  REDIS_CONNECTION_STRING,
} = process.env;
