import {
  AwilixContainer,
  asClass,
  asFunction,
  asValue,
  createContainer,
} from "awilix";
import { MongoClient } from "mongodb";
import { RedisClientType, createClient } from "redis";
import { PrismaClient } from "@prisma/client";
import { MongoCache } from "./cache/mongo-cache";
import {
  MONGODB_CONNECTION_STRING,
  POSTGRESQL_CONNECTION_STRING,
  REDIS_CONNECTION_STRING,
} from "./shared/env";
import {
  MUSIC_BRAINZ_CLIENT_CACHE_KEYS,
  MusicBrainzClient,
} from "./clients/music-brainz-client";
import {
  YOUTUBE_SEARCH_CLIENT_CACHE_KEYS,
  YoutubeSearchClient,
} from "./clients/youtube-search-client";
import { searchRecordings } from "./controllers/search-recordings";
import { playRecording } from "./controllers/play-recording";
import { signUpByPassword } from "./controllers/sign-up-by-password";
import { AuthService } from "./services/auth-service";
import { SessionsRepository } from "./repositories/sessions-repository";
import { signInByPassword } from "./controllers/sign-in-by-password";
import { getPlaylistById } from "./controllers/get-playlist-by-id";
import { getMyPlaylists } from "./controllers/get-my-playlists";
import { getPublicPlaylists } from "./controllers/get-public-playlists";

export type ContainerItems = {
  mongoClient: MongoClient;
  prismaClient: PrismaClient;
  redisClient: RedisClientType;
  metaCache: MongoCache;
  musicBrainzClient: MusicBrainzClient;
  youtubeSearchClient: YoutubeSearchClient;
  authService: AuthService;
  sessionsRepository: SessionsRepository;
  searchRecordings: ReturnType<typeof searchRecordings>;
  playRecording: ReturnType<typeof playRecording>;
  signUpByPassword: ReturnType<typeof signUpByPassword>;
  signInByPassword: ReturnType<typeof signInByPassword>;
  getPlaylistById: ReturnType<typeof getPlaylistById>;
  getMyPlaylists: ReturnType<typeof getMyPlaylists>;
  getPublicPlaylists: ReturnType<typeof getPublicPlaylists>;
};

export const initContainer = async (): Promise<
  AwilixContainer<ContainerItems>
> => {
  const mongoClient = new MongoClient(MONGODB_CONNECTION_STRING);
  const prismaClient = new PrismaClient({
    datasourceUrl: POSTGRESQL_CONNECTION_STRING,
    log: ["query", "info", "warn", "error"],
    errorFormat: "pretty",
  });
  const redisClient: RedisClientType = createClient({
    url: REDIS_CONNECTION_STRING,
  });

  const container = createContainer<ContainerItems>().register({
    mongoClient: asValue(mongoClient),
    prismaClient: asValue(prismaClient),
    redisClient: asValue(redisClient),
    metaCache: asClass(MongoCache),
    musicBrainzClient: asClass(MusicBrainzClient),
    youtubeSearchClient: asClass(YoutubeSearchClient),
    authService: asClass(AuthService),
    sessionsRepository: asClass(SessionsRepository),
    searchRecordings: asFunction(searchRecordings),
    playRecording: asFunction(playRecording),
    signUpByPassword: asFunction(signUpByPassword),
    signInByPassword: asFunction(signInByPassword),
    getPlaylistById: asFunction(getPlaylistById),
    getMyPlaylists: asFunction(getMyPlaylists),
    getPublicPlaylists: asFunction(getPublicPlaylists),
  });

  const { cradle } = container;

  await cradle.mongoClient.connect();
  await cradle.redisClient.connect();

  await cradle.metaCache.setup([
    ...MUSIC_BRAINZ_CLIENT_CACHE_KEYS,
    ...YOUTUBE_SEARCH_CLIENT_CACHE_KEYS,
  ]);

  return container;
};
