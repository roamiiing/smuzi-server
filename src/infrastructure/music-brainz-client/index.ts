const MUSIC_BRAINZ_URL = "https://musicbrainz.eu/ws/2",
  MUSIC_BRAINZ_RECORDINGS_URL = "/recording",
  MUSIC_BRAINZ_BASE_SEARCH_PARAMS = {
    fmt: "json",
  };

export type RecordingDto = {
  id: string;
  score: number;
  title: string;
  length?: number;
  video: any;
  "artist-credit": Array<{
    name: string;
    artist: {
      id: string;
      name: string;
      "sort-name": string;
      aliases?: Array<{
        "sort-name": string;
        name: string;
        locale: any;
        type?: string;
        primary: any;
        "begin-date": any;
        "end-date": any;
        "type-id"?: string;
      }>;
      disambiguation?: string;
    };
    joinphrase?: string;
  }>;
  "first-release-date": string;
  releases: Array<{
    id: string;
    "status-id"?: string;
    count: number;
    title: string;
    status?: string;
    "artist-credit"?: Array<{
      name: string;
      artist: {
        id: string;
        name: string;
        "sort-name": string;
        disambiguation?: string;
      };
      joinphrase?: string;
    }>;
    "release-group": {
      id: string;
      "type-id"?: string;
      "primary-type-id"?: string;
      title: string;
      "primary-type"?: string;
      "secondary-types"?: Array<string>;
      "secondary-type-ids"?: Array<string>;
    };
    date: string;
    country: string;
    "release-events": Array<{
      date: string;
      area: {
        id: string;
        name: string;
        "sort-name": string;
        "iso-3166-1-codes": Array<string>;
      };
    }>;
    "track-count": number;
    media: Array<{
      position: number;
      format?: string;
      track: Array<{
        id: string;
        number: string;
        title: string;
        length?: number;
      }>;
      "track-count": number;
      "track-offset": number;
    }>;
  }>;
  isrcs?: Array<string>;
  disambiguation?: string;
  tags?: Array<{
    count: number;
    name: string;
  }>;
};

export type RecordingsResponseDto = {
  created: string;
  count: number;
  offset: number;
  recordings: Array<RecordingDto>;
};

export type RecordingResponseDto = RecordingDto;

export class MusicBrainzClient {
  constructor(
    private readonly baseUrl = MUSIC_BRAINZ_URL,
    private readonly userAgent = "smuzi-server/0.0.1 (insecure.boxxx+smuzi@gmail.com)",
  ) {}

  private async request<T>(
    subUrl: string,
    specificQueryParams: any = {},
  ): Promise<T> {
    const queryParams = new URLSearchParams({
      ...MUSIC_BRAINZ_BASE_SEARCH_PARAMS,
      ...specificQueryParams,
    });

    const url = `${this.baseUrl}${subUrl}?${queryParams}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": this.userAgent,
      },
    });
    return await response.json();
  }

  async getRecordings(query: string): Promise<RecordingsResponseDto> {
    return await this.request<RecordingsResponseDto>(
      MUSIC_BRAINZ_RECORDINGS_URL,
      {
        query,
        inc: "artists releases artist-credits",
      },
    );
  }

  async getRecordingById(id: string): Promise<RecordingResponseDto> {
    const result = await this.request<any>(`/recording/${id}`, {
      inc: "artists releases artist-credits",
    });

    if (result.error) {
      throw new Error(result.error);
    }

    return result as RecordingResponseDto;
  }
}
