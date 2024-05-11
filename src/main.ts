import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createSchema, createYoga } from "graphql-yoga";
import { initContainer } from "./container";
import {
  PlayRecordingInput,
  PlayRecordingResult,
  SearchRecordingsInput,
  SearchRecordingsResult,
} from "./generated/graphql/types";

const typeDefs = readFileSync(
  resolve(__dirname, "../schema/graphql/schema.graphql"),
  "utf-8",
);

(async () => {
  const { cradle } = await initContainer();

  const schema = createSchema({
    typeDefs,
    resolvers: {
      Query: {
        async playRecording(
          _,
          { input }: { input: PlayRecordingInput },
        ): Promise<PlayRecordingResult> {
          return await cradle.playRecording(input);
        },
        async searchRecordings(
          _,
          { input }: { input: SearchRecordingsInput },
        ): Promise<SearchRecordingsResult> {
          return await cradle.searchRecordings(input);
        },
      },
    },
  });

  const yoga = createYoga({ schema, landingPage: false });

  const server = createServer(yoga);

  server.listen(4000, () => {
    console.info("Server is running on http://localhost:4000/graphql");
  });
})();
