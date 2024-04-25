export type FakeHeadersParams = {
  origin: string;
  referer?: string;
  host?: string;
};

export const createFakeHeaders = ({
  origin,
  referer,
  host,
}: FakeHeadersParams) => ({
  Accept: "*/*",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "ru,en-US;q=0.9,en;q=0.8",
  Connection: "keep-alive",
  Host: host ?? "",
  Origin: origin,
  Referer: referer ?? origin,
  "sec-ch-ua": '"Not-A.Brand";v="99", "Chromium";v="124"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"macOS"',
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "cross-site",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
});
