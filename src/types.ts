export type EventMetaInfo = {
    venue: string,
    address: string,
    date: string,
    openingHours: string,
  }
  
export type EventInfo = {
    title: string,
    artists: string[],
  } & Partial<EventMetaInfo>
  
export type RaEventInfo = {
    randomEventScLink: string,
    eventLink: string,
  } & EventInfo