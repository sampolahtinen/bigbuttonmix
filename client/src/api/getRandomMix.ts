export type Artist = {
  id: string;
  name: string;
  soundcloudUrl: string | null;
  hasErrors: boolean | undefined | null;
};

export type EventInformation = {
  id: string;
  eventUrl: string;
  venue: string;
  title: string;
  date: string;
  openingHours: string;
};

export type RandomMixQueryResponse = {
  randomEvent: EventInformation & {
    artists: Artist[];
    randomTrack: {
      version?: number;
      type?: string;
      provider_name?: string;
      provider_url?: string;
      height?: string;
      width?: string;
      title?: string;
      description?: string;
      thumbnail_url?: string;
      author_url: string;
      author_name?: string;
      html: string;
      widget_src: string;
      track_url: string;
    };
  };
};

export type OembedResponse = {
  version?: number;
  type?: string;
  provider_name?: string;
  provider_url?: string;
  height?: string;
  width?: string;
  title?: string;
  description?: string;
  thumbnail_url?: string;
  author_url: string;
  author_name?: string;
  html: string;
  widget_src: string;
  track_url: string;
};
