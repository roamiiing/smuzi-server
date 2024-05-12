import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { YogaInitialContext, createSchema, createYoga } from "graphql-yoga";
import { initContainer } from "./container";
import {
  PlayRecordingInput,
  PlayRecordingResult,
  SearchRecordingsInput,
  SearchRecordingsResult,
  SignUpByPasswordInput,
  SignUpByPasswordResult,
} from "./generated/graphql/types";
import { useCookies } from "@whatwg-node/server-plugin-cookies";

const typeDefs = readFileSync(
  resolve(__dirname, "../schema/graphql/schema.graphql"),
  "utf-8",
);

const SESSION_ID_COOKIE_NAME = "sessid";

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
      Mutation: {
        async signUpByPassword(
          _,
          { input }: { input: SignUpByPasswordInput },
          ctx: YogaInitialContext,
        ): Promise<SignUpByPasswordResult> {
          const { result, session } = await cradle.signUpByPassword(input);

          if (session)
            ctx.request.cookieStore?.set(
              SESSION_ID_COOKIE_NAME,
              session.sessionId,
            );

          return result;
        },
      },
    },
  });

  const yoga = createYoga({
    schema,
    landingPage: false,
    plugins: [useCookies()],
  });

  const server = createServer(yoga);

  server.listen(4000, () => {
    console.info("Server is running on http://localhost:4000/graphql");
  });
})();
