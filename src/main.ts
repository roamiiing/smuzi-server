import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { YogaInitialContext, createSchema, createYoga } from "graphql-yoga";
import { useCookies } from "@whatwg-node/server-plugin-cookies";
import { ContainerItems, initContainer } from "./container";
import {
  PlayRecordingInput,
  PlayRecordingResult,
  RefreshSessionResult,
  SearchRecordingsInput,
  SearchRecordingsResult,
  SignInByPasswordInput,
  SignInByPasswordResult,
  SignOutResult,
  SignUpByPasswordInput,
  SignUpByPasswordResult,
} from "./generated/graphql/types";

const typeDefs = readFileSync(
  resolve(__dirname, "../schema/graphql/schema.graphql"),
  "utf-8",
);

const SESSION_ID_COOKIE_NAME = "sessid";

const tryRefreshSession = async (
  ctx: YogaInitialContext,
  cradle: ContainerItems,
) => {
  const nowUtc = Date.now();
  const sessionId = await ctx.request.cookieStore?.get(SESSION_ID_COOKIE_NAME);

  if (sessionId?.value) {
    const session = await cradle.authService.refreshSession(
      sessionId.value,
      nowUtc,
    );

    if (session) {
      await ctx.request.cookieStore?.set(
        SESSION_ID_COOKIE_NAME,
        session.sessionId,
      );

      const currentUser = await cradle.authService.getUserBySession(
        session.sessionId,
        nowUtc,
      );

      return currentUser;
    } else await ctx.request.cookieStore?.delete(SESSION_ID_COOKIE_NAME);
  }
};

(async () => {
  const { cradle } = await initContainer();

  const schema = createSchema({
    typeDefs,
    resolvers: {
      Query: {
        async playRecording(
          _,
          { input }: { input: PlayRecordingInput },
          ctx: YogaInitialContext,
        ): Promise<PlayRecordingResult> {
          await tryRefreshSession(ctx, cradle);
          return await cradle.playRecording(input);
        },
        async searchRecordings(
          _,
          { input }: { input: SearchRecordingsInput },
          ctx: YogaInitialContext,
        ): Promise<SearchRecordingsResult> {
          await tryRefreshSession(ctx, cradle);
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
            await ctx.request.cookieStore?.set(
              SESSION_ID_COOKIE_NAME,
              session.sessionId,
            );

          return result;
        },
        async signInByPassword(
          _,
          { input }: { input: SignInByPasswordInput },
          ctx: YogaInitialContext,
        ): Promise<SignInByPasswordResult> {
          const { result, session } = await cradle.signInByPassword(input);

          if (session)
            await ctx.request.cookieStore?.set(
              SESSION_ID_COOKIE_NAME,
              session.sessionId,
            );

          return result;
        },
        async refreshSession(
          _,
          __,
          ctx: YogaInitialContext,
        ): Promise<RefreshSessionResult> {
          const currentUser = await tryRefreshSession(ctx, cradle);

          return {
            success: !!currentUser,
          };
        },
        async signOut(_, __, ctx: YogaInitialContext): Promise<SignOutResult> {
          const sessionId = await ctx.request.cookieStore?.get(
            SESSION_ID_COOKIE_NAME,
          );
          if (sessionId)
            await cradle.authService.deleteSession(sessionId.value);

          return {
            success: true,
          };
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
