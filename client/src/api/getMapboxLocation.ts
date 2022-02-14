import axios from 'axios';

export const mapboxGeocodingApiUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/`;

export interface MapboxReverseGeocodeResponse {
  type: string;
  query: number[];
  features: FeaturesEntity[];
  attribution: string;
}

export interface FeaturesEntity {
  id: string;
  type: string;
  place_type?: string[] | null;
  relevance: number;
  properties: Properties;
  text: string;
  place_name: string;
  center?: number[] | null;
  geometry: Geometry;
  address?: string | null;
  context?: ContextEntity[] | null;
  bbox?: number[] | null;
}
export interface Properties {
  accuracy?: string;
  wikidata?: string;
  short_code?: string;
}

export interface Geometry {
  type: string;
  coordinates?: number[] | null;
}
export interface ContextEntity {
  id: string;
  text: string;
  wikidata?: string | null;
  short_code?: string | null;
}

export const getMapboxLocation = (latitude: number, longitude: number) => {
  const url =
    mapboxGeocodingApiUrl +
    `${longitude},${latitude}.json?access_token=${process.env.MAPBOX_TOKEN}`;
  return axios.get<MapboxReverseGeocodeResponse>(url);
};
