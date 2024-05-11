import { MusicBrainzClient } from "../clients/music-brainz-client";
import {
  SearchRecordingsInput,
  SearchRecordingsResult,
} from "../generated/graphql/types";
import { mapRecording } from "../mappers/recording";
import { escapeLucene } from "../shared/escape-lucene";

export type SearchRecordingsDeps = {
  musicBrainzClient: MusicBrainzClient;
};

export const searchRecordings =
  ({ musicBrainzClient }: SearchRecordingsDeps) =>
  async (input: SearchRecordingsInput): Promise<SearchRecordingsResult> => {
    const escapedQuery = escapeLucene(input.query);
    const processedQuery = escapedQuery
      .trim()
      .split(/\s+/g)
      .filter((word) => word.length > 0)
      .map(escapeLucene)
      .map((word) => `${word}* OR artist:${word}*`)
      .join(" OR ");

    let recordingsDto;

    try {
      recordingsDto =
        await musicBrainzClient.getRecordingsByQuery(processedQuery);
    } catch (e) {
      console.error(e);
      return { recordings: [] };
    }

    return {
      recordings: recordingsDto.recordings.map(mapRecording),
    };
  };
