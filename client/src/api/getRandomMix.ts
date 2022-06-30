export type Artist = {
  id: string;
  name: string;
  soundcloudUrl: string;
};

export type EventInformation = {
  id: string;
  eventUrl: string;
  venue: string;
  title: string;
  date: string;
  openingHours: string;
  artists: Artist[];
};

export type RandomMixQueryResponse = {
  randomEvent: EventInformation & {
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
