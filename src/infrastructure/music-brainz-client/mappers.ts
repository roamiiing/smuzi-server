import { RecordingDto } from ".";
import { Recording, ReleaseStatus } from "../generated/graphql/types";

export const mapRecording = (recordingDto: RecordingDto): Recording => ({
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
      name: artistCreditDto.name ?? artistCreditDto.artist.name ?? "Неизвестен",
      artist: {
        id: artistCreditDto.artist.id,
        name: artistCreditDto.artist.name ?? "Неизвестен",
        sortName:
          artistCreditDto.artist["sort-name"] ?? artistCreditDto.artist.name,
      },
      joinOn: artistCreditDto.joinphrase,
    })) ?? [],
});

export const getArtistsString = (recording: Recording) => {
  return recording.artists
    .map(
      (artist) => (artist.name || artist.artist.name) + (artist.joinOn ?? ""),
    )
    .join("");
};

export const getFullTrackName = (recording: Recording) =>
  getArtistsString(recording) + " - " + recording.title;
