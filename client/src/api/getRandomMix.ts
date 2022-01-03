import axios from 'axios';
import { apiUrl } from './index';

type GetRandomMixParams = {
  country?: string;
  city?: string;
  date?: string;
  autoPlay?: boolean;
};

export type SoundcloudOembedResponse = {
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
  widgetSrc: string;
};

export const getRandomMix = (params: GetRandomMixParams) => {
  const url = apiUrl + '/random-soundcloud-track';
  return axios.get(url, {
    params
  });
};
