import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createSchema, createYoga } from "graphql-yoga";
import {
  Recording,
  ReleaseStatus,
  SearchRecordingsInput,
} from "./infrastructure/generated/graphql/types";
import { MusicBrainzClient } from "./infrastructure/music-brainz-client";

const typeDefs = readFileSync(
  resolve(__dirname, "../schema/graphql/schema.graphql"),
  "utf-8",
);

const schema = createSchema({
  typeDefs,
  resolvers: {
    Query: {
      async searchRecordings(
        _,
        { input }: { input: SearchRecordingsInput },
      ): Promise<Recording[]> {
        console.log(input);
        try {
          const musicBrainzClient = new MusicBrainzClient();
          const escapeLucene = (input: string) => {
            const escaped = input.replace(
              /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,
              "\\$&",
            );
            return escaped;
          };
          const processedQuery = input.query
            .split(" ")
            .map(escapeLucene)
            .map((a) => `${a}* OR artist:${a}*`)
            .join(" OR ");

          const recordingsDto =
            await musicBrainzClient.getRecordings(processedQuery);

          return recordingsDto.recordings.map((recordingDto) => ({
            id: recordingDto.id,
            title: recordingDto.title,
            durationMs: recordingDto.length ?? 0,
            firstReleaseDate: recordingDto["first-release-date"],
            releases:
              recordingDto.releases?.map((releaseDto) => ({
                id: releaseDto.id,
                title: releaseDto.title,
                coverUrl: `https://coverartarchive.org/release/${releaseDto.id}/front`,
                status:
                  {
                    Official: ReleaseStatus.Official,
                    Promotion: ReleaseStatus.Promotion,
                    Bootleg: ReleaseStatus.Bootleg,
                    Withdrawn: ReleaseStatus.Withdrawn,
                    PseudoRelease: ReleaseStatus.PseudoRelease,
                    Cancelled: ReleaseStatus.Cancelled,
                    "": ReleaseStatus.Unknown,
                  }[releaseDto.status ?? ""] ?? ReleaseStatus.Unknown,
                artists:
                  releaseDto["artist-credit"]?.map((artistCreditDto) => ({
                    name: artistCreditDto.name ?? "Неизвестен",
                    artist: {
                      id: artistCreditDto.artist.id,
                      name: artistCreditDto.artist.name ?? "Неизвестен",
                      sortName:
                        artistCreditDto.artist["sort-name"] ??
                        artistCreditDto.artist.name,
                    },
                    joinOn: artistCreditDto.joinphrase,
                  })) ?? [],
                date: releaseDto.date,
              })) ?? [],
            artists:
              recordingDto["artist-credit"]?.map((artistCreditDto) => ({
                name:
                  artistCreditDto.name ??
                  artistCreditDto.artist.name ??
                  "Неизвестен",
                artist: {
                  id: artistCreditDto.artist.id,
                  name: artistCreditDto.artist.name ?? "Неизвестен",
                  sortName:
                    artistCreditDto.artist["sort-name"] ??
                    artistCreditDto.artist.name,
                },
                joinOn: artistCreditDto.joinphrase,
              })) ?? [],
          }));
        } catch (e) {
          console.error(e);
          return [];
        }
      },
    },
  },
});

const yoga = createYoga({ schema, landingPage: false });

const server = createServer(yoga);

server.listen(4000, () => {
  console.info("Server is running on http://localhost:4000/graphql");
});
