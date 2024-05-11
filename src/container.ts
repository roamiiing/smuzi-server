import {
  AwilixContainer,
  asClass,
  asFunction,
  asValue,
  createContainer,
} from "awilix";
import { MongoClient } from "mongodb";
import { MongoCache } from "./cache/mongo-cache";
import { MONGODB_CONNECTION_STRING } from "./shared/env";
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

export type ContainerItems = {
  mongoClient: MongoClient;
  metaCache: MongoCache;
  musicBrainzClient: MusicBrainzClient;
  youtubeSearchClient: YoutubeSearchClient;
  searchRecordings: ReturnType<typeof searchRecordings>;
  playRecording: ReturnType<typeof playRecording>;
};

export const initContainer = async (): Promise<
  AwilixContainer<ContainerItems>
> => {
  const mongoClient = new MongoClient(MONGODB_CONNECTION_STRING);

  const container = createContainer<ContainerItems>().register({
    mongoClient: asValue(mongoClient),
    metaCache: asClass(MongoCache),
    musicBrainzClient: asClass(MusicBrainzClient),
    youtubeSearchClient: asClass(YoutubeSearchClient),
    searchRecordings: asFunction(searchRecordings),
    playRecording: asFunction(playRecording),
  });

  const { cradle } = container;

  await cradle.mongoClient.connect();

  await cradle.metaCache.setup([
    ...MUSIC_BRAINZ_CLIENT_CACHE_KEYS,
    ...YOUTUBE_SEARCH_CLIENT_CACHE_KEYS,
  ]);

  return container;
};
