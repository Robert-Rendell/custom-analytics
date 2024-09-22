export type PageUrl = string;

export type PageViewerDocument = {
  pageUrl: PageUrl;
  views: PageView[];
  total: number;
};

export type PageView = {
  ipAddress: string;
  ipLocation?: IPLocation;
  dateTime: string;
};

export type PageViewRequest = {
  pageUrl: PageUrl;
} & PageView;

export type LatLng = [number, number];

export type IPLocation = {
  range: [number, number];
  country: string;
  region: string;
  eu: string;
  timezone: string;
  city: string;
  ll: LatLng;
  metro: number;
  area: number;
};
