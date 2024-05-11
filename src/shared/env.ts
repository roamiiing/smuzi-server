if (!process.env.MONGODB_CONNECTION_STRING)
  throw new Error("MONGODB_CONNECTION_STRING environment variable is not set");

export const { MONGODB_CONNECTION_STRING } = process.env;
