import { DataSource } from 'apollo-datasource';

export type Location = {
  country: string;
  city: string;
};

export type EventArgs = {
  city: string;
  country: string;
  date: string; // Format: "2022-01-04" YYYY-MM-DD
  autoPlay?: boolean;
};

export type SoundCloudMeta = {
  version: number;
  type: string;
  provider_name: string;
  provider_url: string;
  height: string;
  width: string;
  title: string;
  description: string;
  thumbnail_url: string;
  html: string;
  author_name: string;
  author_url: string;
  widget_src: string;
  track_url: string;
};

export type EventMetaInfo = {
  venue: string;
  address: string;
  date: string;
  openingHours: string;
};

export type EventArtist = {
  name: string;
  id: string;
  soundcloudUrl?: string;
};

export type EventDetails = {
  id: string;
  eventUrl: string;
  title: string;
  artists: EventArtist[];
} & Partial<EventMetaInfo>;

export type RaEventDetails = {
  eventUrl: string;
} & EventDetails;

export type RandomEventResponse = RaEventDetails & {
  randomTrack: SoundCloudMeta;
};

export type SoundCloudOembedResponse = {
  version: number;
  type: string;
  provider_name: string;
  provider_url: string;
  height: string;
  width: string;
  title: string;
  description: string;
  thumbnail_url: string;
  html: string;
  author_name: string;
  author_url: string;
  widget_src: string;
  track_url: string;
};

export enum ErrorMessages {
  'NoEvents' = 'No events for given location.',
  'EventHasNoSoundcloud' = 'None of the events have artist with soundcloud tracks.',
  'Timeout' = 'Timeout'
}

export enum ErrorCodes {
  'NotFound' = '404',
  'Timeout' = '408'
}

export interface RaScraper extends DataSource {
  getRandomEvent(args: EventArgs): Promise<RandomEventResponse>;
}
