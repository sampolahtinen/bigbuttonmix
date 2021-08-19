export type EventMetaInfo = {
  venue: string;
  address: string;
  date: string;
  openingHours: string;
};

export type EventArtist = {
  name: string;
  profileLink: string;
};

export type EventDetails = {
  title: string;
  artists: EventArtist[];
} & Partial<EventMetaInfo>;

export type RaEventDetails = {
  randomEventScLink: string;
  eventLink: string;
} & EventDetails;
