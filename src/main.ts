import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createSchema, createYoga } from "graphql-yoga";
import {
  PlayRecordingInput,
  PlayRecordingResult,
  ReleaseStatus,
  SearchRecordingsInput,
  SearchRecordingsResult,
} from "./infrastructure/generated/graphql/types";
import { MusicBrainzClient } from "./infrastructure/music-brainz-client";
import {
  getFullTrackName,
  mapRecording,
} from "./infrastructure/music-brainz-client/mappers";
import { getRelevantAudioUrl } from "./infrastructure/youtube-search-client";

const typeDefs = readFileSync(
  resolve(__dirname, "../schema/graphql/schema.graphql"),
  "utf-8",
);

const musicBrainzClient = new MusicBrainzClient();

const schema = createSchema({
  typeDefs,
  resolvers: {
    Query: {
      async playRecording(
        _,
        { input }: { input: PlayRecordingInput },
      ): Promise<PlayRecordingResult> {
        const recordingDto = await musicBrainzClient.getRecordingById(
          input.recordingId,
        );

        const recording = mapRecording(recordingDto);

        const fullTrackName = getFullTrackName(recording);

        const relevantInfo = await getRelevantAudioUrl(
          fullTrackName,
          recording.durationMs,
        );

        if (!relevantInfo) {
          throw new Error("Failed to find relevant audio");
        }

        const { url, duration: durationMs } = relevantInfo;

        const restreamServicePayload = {
          source: "youtube",
          url,
        };

        const restreamUrl = `https://re.x.talkiiing.ru/${recording.id}.webm?p=${btoa(JSON.stringify(restreamServicePayload))}`;

        return {
          recording,
          streamUrl: restreamUrl,
          durationMs,
        };
      },
      async searchRecordings(
        _,
        { input }: { input: SearchRecordingsInput },
      ): Promise<SearchRecordingsResult> {
        console.log(input);
        try {
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

          return {
            recordings: recordingsDto.recordings.map(mapRecording),
          };
        } catch (e) {
          console.error(e);
          return { recordings: [] };
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
