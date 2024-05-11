import { MusicBrainzClient } from "../clients/music-brainz-client";
import { YoutubeSearchClient } from "../clients/youtube-search-client";
import {
  PlayRecordingInput,
  PlayRecordingResult,
} from "../generated/graphql/types";
import { mapRecording } from "../mappers/recording";
import { getFullTrackName } from "../models/recording";

export type PlayRecordingDeps = {
  musicBrainzClient: MusicBrainzClient;
  youtubeSearchClient: YoutubeSearchClient;
};

export const playRecording =
  ({ musicBrainzClient, youtubeSearchClient }: PlayRecordingDeps) =>
  async (input: PlayRecordingInput): Promise<PlayRecordingResult> => {
    const recordingDto = await musicBrainzClient.getRecordingById(
      input.recordingId,
    );

    const recording = mapRecording(recordingDto);
    const fullTrackName = getFullTrackName(recording);

    const relevantInfo = await youtubeSearchClient.getRelevantAudioUrl({
      query: fullTrackName,
      durationMs: recording.durationMs,
    });

    if (!relevantInfo) {
      throw new Error("Failed to find relevant audio");
    }

    const { url, duration: durationMs } = relevantInfo;

    return {
      recording,
      streamUrl: url,
      durationMs,
    };
  };
