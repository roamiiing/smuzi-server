import { argon2id, hash, verify } from "argon2";
import * as crypto from "node:crypto";
import { PrismaClient, User } from "@prisma/client";
import { Session } from "../models/session";
import { SessionsRepository } from "../repositories/sessions-repository";
import { DAYS } from "../shared/units";

const SESSION_EXPIRES_MS = 10 * DAYS;

export type AuthServiceDeps = {
  sessionsRepository: SessionsRepository;
  prismaClient: PrismaClient;
};

export class AuthService {
  constructor(private readonly deps: AuthServiceDeps) {}

  async initSession(userId: string, nowUtc: number): Promise<Session> {
    const bytes = new Uint8Array(255);
    crypto.getRandomValues(bytes);
    const sessionId = Buffer.from(bytes).toString("hex");

    const session: Session = {
      userId,
      expiresUtc: nowUtc + SESSION_EXPIRES_MS,
      sessionId,
    };

    await this.deps.sessionsRepository.set(sessionId, session, nowUtc);

    return session;
  }

  async refreshSession(
    sessionId: string,
    nowUtc: number,
  ): Promise<Session | null> {
    const session = await this.deps.sessionsRepository.get(sessionId);

    if (!session) return null;
    if (session.expiresUtc < nowUtc) return null;

    await this.deps.sessionsRepository.delete(sessionId);

    return await this.initSession(session.userId, nowUtc);
  }

  async getUserBySession(
    sessionId: string,
    nowUtc: number,
  ): Promise<User | null> {
    const session = await this.deps.sessionsRepository.get(sessionId);

    if (!session) return null;
    if (session.expiresUtc < nowUtc) return null;

    return await this.deps.prismaClient.user.findUnique({
      where: { id: session.userId },
    });
  }

  public static async verifyPassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return await verify(hash, password);
  }

  public static async hashPassword(password: string): Promise<string> {
    return await hash(password, {
      type: argon2id,
      memoryCost: 2 ** 16,
      timeCost: 5,
      parallelism: 1,
    });
  }
}
