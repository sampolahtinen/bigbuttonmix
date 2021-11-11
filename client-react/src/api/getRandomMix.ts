import axios from 'axios';
import { apiUrl } from './index';

type GetRandomMixParams = {
  country?: string;
  city?: string;
  date?: string;
  autoPlay?: boolean;
};

export const getRandomMix = (params: GetRandomMixParams) => {
  const url = apiUrl + 'random-soundcloud-track';
  return axios.get(url, {
    params
  });
};
