import { RecordingDto } from ".";
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

export const mapRecording = (recordingDto: RecordingDto): Recording => {
  const releases = recordingDto.releases?.map(mapRecordingRelease) ?? [];
  const priorityRelease = getPriorityRelease(releases);

  return {
    id: recordingDto.id,
    title: recordingDto.title,
    durationMs: recordingDto.length ?? 0,
    firstReleaseDate: recordingDto["first-release-date"],
    releases,
    coverUrl: priorityRelease?.coverUrl,
    artists:
      recordingDto["artist-credit"]?.map((artistCreditDto) => ({
        name:
          artistCreditDto.name ?? artistCreditDto.artist.name ?? "Неизвестен",
        artist: {
          id: artistCreditDto.artist.id,
          name: artistCreditDto.artist.name ?? "Неизвестен",
          sortName:
            artistCreditDto.artist["sort-name"] ?? artistCreditDto.artist.name,
        },
        joinOn: artistCreditDto.joinphrase,
      })) ?? [],
  };
};

export const mapRecordingRelease = (
  releaseDto: RecordingDto["releases"][number],
): RecordingRelease => {
  return {
    id: releaseDto.id,
    title: releaseDto.title,
    coverUrl: getReleaseCoverUrl(releaseDto.id),
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
            artistCreditDto.artist["sort-name"] ?? artistCreditDto.artist.name,
        },
        joinOn: artistCreditDto.joinphrase,
      })) ?? [],
    date: releaseDto.date,
  };
};

export const getArtistsString = (recording: Recording) => {
  return recording.artists
    .map(
      (artist) => (artist.name || artist.artist.name) + (artist.joinOn ?? ""),
    )
    .join("");
};

export const getFullTrackName = (recording: Recording) =>
  getArtistsString(recording) + " - " + recording.title;
