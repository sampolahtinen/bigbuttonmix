import axios from 'axios';
import { apiUrl } from './index';

type GetRandomMixParams = {
  country?: string;
  city?: string;
  date?: string;
  autoPlay?: boolean;
};

export type EventInformation = {
  eventLink: string;
  venue: string;
  title: string;
  date: string;
  openingHours: string;
};

export type RandomMixResponse = {
  soundcloud: {
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
  event: EventInformation;
};

export const getRandomMix = (params: GetRandomMixParams) => {
  const url = apiUrl + '/random-soundcloud-track';
  return axios.get<RandomMixResponse>(url, {
    params
  });
};
