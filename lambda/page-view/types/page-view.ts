export type PageUrl = string;

export type PageViewerDocument = {
  pageUrl: PageUrl;
  views: (PageView | PageViewV2)[];
  total: number;
};

export type PageView = {
  ipAddress: string;
  ipLocation?: IPLocation;
  dateTime: string;
};

export type IPLocation = {
  range: [number, number];
  country: string;
  region: string;
  eu: string;
  timezone: string;
  city: string;
  ll: [number, number];
  metro: number;
  area: number;
};

export interface PageViewV2 {
  ipAddress: string;
  dateTime: string;
  ipLocation: IPLocationV2;
  vpn: boolean;
  provider: string;
  userAgent: string;
}

export type IPLocationV2 = {
  country: string;
  region: string;
  city: string;
  ll: [number, number];
};

export type PageViewRequest = {
  pageUrl: PageUrl;
} & PageView;
