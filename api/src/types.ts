export type EventMetaInfo = {
  venue: string;
  address: string;
  date: string;
  openingHours: string;
};

export type EventArtist = {
  name: string;
  id: string;
};

export type EventDetails = {
  id: string;
  eventUrl: string;
  title: string;
  artists: EventArtist[];
} & Partial<EventMetaInfo>;

export type RaEventDetails = {
  randomEventScLink: string;
  eventLink: string;
} & EventDetails;
