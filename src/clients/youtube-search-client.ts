import jsdom from "jsdom";
import { getInfo } from "ytdl-core";
import { createFakeHeaders } from "../shared/fake-headers";
import { Cache } from "../cache/cache";
import { HOURS } from "../shared/units";

const YOUTUBE_SEARCH_URL = "https://youtube.com/results";
const YOUTUBE_HEADERS = {
  ...createFakeHeaders({
    origin: "https://www.youtube.com",
    referer: "https://www.youtube.com/",
    host: "www.youtube.com",
  }),
  "Content-Type": "text/html; charset=utf-8",
};

const isValidVideoTitle = (videoName: string, query: string) =>
  [
    "cover",
    "remix",
    "playlist",
    "double",
    "dual",
    "mix",
    "mixtape",
    "radio",
    "edit",
    "slowed",
    "reverb",
    "speed up",
    "кавер",
    "ремикс",
    "плейлист",
  ].every(
    (keyword) =>
      !(
        (videoName.toLowerCase().includes(keyword) &&
          !query.toLowerCase().includes(keyword)) ||
        (!videoName.toLowerCase().includes(keyword) &&
          query.toLowerCase().includes(keyword))
      ),
  );

const getYoutubeSearchResultsPage = async (query: string) => {
  const url = `${YOUTUBE_SEARCH_URL}?search_query=${query}`;
  const response = await fetch(url, {
    headers: YOUTUBE_HEADERS,
  });
  return await response.text();
};

const getYoutubeSearchResults = (html: string) => {
  const doc = new jsdom.JSDOM(html);

  if (!doc) {
    throw new Error("Failed to parse HTML");
  }

  const scripts = Array.from(doc.window.document.querySelectorAll("script"));

  const ytInitialDataScript = scripts.find((script) =>
    script.textContent?.includes("ytInitialData"),
  );

  if (!ytInitialDataScript) {
    throw new Error("Failed to find ytInitialData script");
  }

  const ytInitialData = ytInitialDataScript.textContent?.match(
    /ytInitialData\s*=\s*(.*);/,
  )?.[1];

  if (!ytInitialData) {
    throw new Error("Failed to find ytInitialData");
  }

  const ytInitialDataJson = JSON.parse(ytInitialData);

  const videos =
    ytInitialDataJson.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents
      .map((content: any) => {
        const videoRenderer = content.videoRenderer;

        if (!videoRenderer) {
          return null;
        }

        const videoId = videoRenderer.videoId as string;
        const title = videoRenderer.title.runs[0].text as string;
        const duration =
          (videoRenderer.lengthText?.simpleText as string)
            .split(":")
            .reduce((acc, v, i, a) => {
              return acc + parseInt(v) * Math.pow(60, a.length - i - 1);
            }, 0) * 1000; // 0:30 / 2:55 / 1:45:33

        const viewCount = parseInt(
          (videoRenderer.viewCountText?.simpleText as string)
            .match(/((\d\s*)+)/)?.[0]
            ?.replaceAll(/\s/g, "") ?? "0",
        );

        return {
          videoId,
          title,
          duration,
          viewCount,
        };
      })
      .filter(Boolean) as {
      videoId: string;
      title: string;
      duration: number;
      viewCount: number;
    }[];

  return videos;
};

const MAX_VIDEO_DURATION_MS = 60 * 60 * 1000;
const MAX_VIDEO_DURATION_DEVIATION_MS = 30 * 1000;

const filterVideos = (
  originalQuery: string,
  originalDurationMs: number,
  videos: ReturnType<typeof getYoutubeSearchResults>,
) =>
  videos
    .filter((video) => isValidVideoTitle(video.title, originalQuery))
    .filter((video) => video.duration <= MAX_VIDEO_DURATION_MS)
    .filter(
      (video) =>
        Math.abs(originalDurationMs - video.duration) <=
        MAX_VIDEO_DURATION_DEVIATION_MS,
    );

const AUDIO_QUALITY_MAP: Record<string, number> = {
  AUDIO_QUALITY_LOW: 1,
  AUDIO_QUALITY_MEDIUM: 2,
  AUDIO_QUALITY_HIGH: 3,
};

export type RelevantAudioInfo = {
  url: string;
  duration: number;
};

const getRelevantAudioUrl = async (
  query: string,
  durationMs: number,
): Promise<RelevantAudioInfo | null> => {
  const html = await getYoutubeSearchResultsPage(query);

  const videos = getYoutubeSearchResults(html);

  console.log("Found", videos.length, "videos");
  console.log(videos.map((video) => video.title));

  const filteredVideos = filterVideos(query, durationMs, videos);
  if (filteredVideos.length === 0) {
    return null;
  }

  console.log("After filtering", filteredVideos.length, "videos");
  console.log(filteredVideos.map((video) => video.title));

  const video = filteredVideos[0];

  const info = await getInfo(video.videoId, {});

  const formats = info.player_response.streamingData.adaptiveFormats;
  if (!formats) {
    return null;
  }

  const neededFormat = formats
    .filter((format: any) => format.mimeType.includes("audio/webm"))
    .sort((a: any, b: any) =>
      a.audioQuality && b.audioQuality
        ? AUDIO_QUALITY_MAP[a.audioQuality] - AUDIO_QUALITY_MAP[b.audioQuality]
        : a.bitrate - b.bitrate,
    )
    .at(-1);
  if (!neededFormat) {
    return null;
  }

  const duration =
    parseInt(info.player_response.videoDetails.lengthSeconds) * 1000;

  return { url: (neededFormat as any).url, duration };
};

export const enum YoutubeSearchClientCacheKey {
  GetRelevantAudioUrl = "YouTubeSearchClient_GetRelevantAudioUrl",
}

export const YOUTUBE_SEARCH_CLIENT_CACHE_KEYS: ReadonlyArray<YoutubeSearchClientCacheKey> =
  [YoutubeSearchClientCacheKey.GetRelevantAudioUrl];

export type YoutubeSearchClientInput = {
  query: string;
  durationMs: number;
};

export type YoutubeSearchClientDeps = {
  metaCache: Cache;
};

export class YoutubeSearchClient {
  constructor(private readonly deps: YoutubeSearchClientDeps) {
    this.getRelevantAudioUrl = this.deps.metaCache.memoized(
      YoutubeSearchClientCacheKey.GetRelevantAudioUrl,
      this.getRelevantAudioUrl.bind(this),
      {
        ttl: 6 * HOURS,
      },
    );
  }

  async getRelevantAudioUrl(
    input: YoutubeSearchClientInput,
  ): Promise<RelevantAudioInfo | null> {
    return await getRelevantAudioUrl(input.query, input.durationMs);
  }
}

if (require.main === module) {
  getRelevantAudioUrl("bones hdmi", 137000).then(console.log);
}
