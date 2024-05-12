import { RedisClientType } from "redis";
import { Session } from "../models/session";
import { SECONDS } from "../shared/units";

export type SessionsRepositoryDeps = {
  redisClient: RedisClientType;
};

export class SessionsRepository {
  constructor(private readonly deps: SessionsRepositoryDeps) {}

  async get(key: string): Promise<Session | null> {
    const value = await this.deps.redisClient.get(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value);
  }

  async set(key: string, value: Session, nowUtc: number): Promise<void> {
    const serialized = JSON.stringify(value);
    const expireIn = (value.expiresUtc - nowUtc) / SECONDS;

    await this.deps.redisClient.set(key, serialized, {
      EX: expireIn,
    });
  }

  async delete(key: string): Promise<void> {
    await this.deps.redisClient.del(key);
  }
}
