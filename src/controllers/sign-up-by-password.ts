import { PlaylistType, PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { z } from "zod";
import {
  SignUpByPasswordInput,
  SignUpByPasswordResult,
} from "../generated/graphql/types";
import { Username } from "../models/username";
import { Password } from "../models/password";
import { mapValidationErrors } from "../models/error";
import { AuthService } from "../services/auth-service";
import { AuthSource } from "../models/auth";
import { Session } from "../models/session";

const SignUpByPasswordInputModel = z.object({
  username: Username,
  password: Password,
});

export type SignUpByPasswordControllerResult = {
  result: SignUpByPasswordResult;
  session: Session | null;
};

export type SignUpByPasswordDeps = {
  prismaClient: PrismaClient;
  authService: AuthService;
};

export const signUpByPassword =
  ({ prismaClient, authService }: SignUpByPasswordDeps) =>
  async (
    input: SignUpByPasswordInput,
  ): Promise<SignUpByPasswordControllerResult> => {
    const nowUtc = Date.now();
    const parsed = SignUpByPasswordInputModel.safeParse(input);

    if (!parsed.success) {
      return { result: mapValidationErrors(parsed.error), session: null };
    }

    const { username, password } = parsed.data;

    try {
      const user = await prismaClient.$transaction(async (transaction) => {
        const user = await transaction.user.create({
          data: {
            username,
            authSource: AuthSource.Password,
            authParams: { password: await AuthService.hashPassword(password) },
          },
        });

        await transaction.playlist.create({
          data: {
            owner: {
              connect: {
                id: user.id,
              },
            },
            name: "Liked Songs",
            description: `${user.username}'s liked songs`,
            type: PlaylistType.Liked,
          },
        });

        return user;
      });

      return {
        result: {
          __typename: "SignUpByPasswordResultSuccess",
          me: {
            id: user.id,
            username: user.username,
          },
        },
        session: await authService.initSession(user.id, nowUtc),
      };
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === "P2002") {
        return {
          result: {
            __typename: "AlreadyExistsError",
            message: "Username already exists",
          },
          session: null,
        };
      }

      throw e;
    }
  };
