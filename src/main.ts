import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createSchema, createYoga } from "graphql-yoga";

const typeDefs = readFileSync(
  resolve(__dirname, "../schema/graphql/schema.graphql"),
  "utf-8",
);

const schema = createSchema({
  typeDefs,
  resolvers: {
    Query: {},
  },
});

const yoga = createYoga({ schema, landingPage: false });

const server = createServer(yoga);

server.listen(4000, () => {
  console.info("Server is running on http://localhost:4000");
});
