import { PrismaClient } from "@prisma/client";
import {
  SignInByPasswordInput,
  SignInByPasswordResult,
} from "../generated/graphql/types";
import { AuthService } from "../services/auth-service";
import { Session } from "../models/session";

export type SignInByPasswordControllerResult = {
  result: SignInByPasswordResult;
  session: Session | null;
};

export type SignInByPasswordDeps = {
  prismaClient: PrismaClient;
  authService: AuthService;
};

export const signInByPassword =
  ({ prismaClient, authService }: SignInByPasswordDeps) =>
  async (
    input: SignInByPasswordInput,
  ): Promise<SignInByPasswordControllerResult> => {
    const nowUtc = Date.now();
    const { username, password } = input;

    const user = await prismaClient.user.findUnique({
      where: { username },
    });
    const hash = (user?.authParams?.valueOf() as { password: string })
      ?.password;

    if (!user || !hash) {
      return {
        result: {
          __typename: "UnauthenticatedError",
          message: "Invalid credentials",
        },
        session: null,
      };
    }

    const isValidPassword = await AuthService.verifyPassword(password, hash);
    if (!isValidPassword) {
      return {
        result: {
          __typename: "UnauthenticatedError",
          message: "Invalid credentials",
        },
        session: null,
      };
    }

    return {
      result: {
        __typename: "SignInByPasswordResultSuccess",
        me: {
          id: user.id,
          username: user.username,
        },
      },
      session: await authService.initSession(user.id, nowUtc),
    };
  };
