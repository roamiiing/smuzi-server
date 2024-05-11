import {
  Recording,
  RecordingRelease,
  ReleaseStatus,
} from "../generated/graphql/types";

export const getPriorityRelease = (releases: RecordingRelease[]) =>
  releases.find((release) => release.status === ReleaseStatus.Official) ??
  releases[0];

export const getReleaseCoverUrl = (id: string) =>
  `https://coverartarchive.org/release/${id}/front`;

export const getArtistsString = (recording: Recording) => {
  return recording.artists
    .map(
      (artist) => (artist.name || artist.artist.name) + (artist.joinOn ?? ""),
    )
    .join("");
};

export const getFullTrackName = (recording: Recording) =>
  getArtistsString(recording) + " - " + recording.title;
