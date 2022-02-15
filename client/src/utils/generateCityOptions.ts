import {
  append,
  flatten,
  map,
  pipe,
  prop,
  propEq,
  reduce,
  reject,
  sortBy
} from 'ramda';
import { LocationOptions } from '../constants/locationOptions';

type Subregion = {
  id: string;
  name: string;
  isCountry: boolean;
  urlName: string;
  parentId: string | number;
  country: {
    id: string;
    name: string;
    urlCode: string;
    __typename: string;
  };
  __typename: string;
};

type Area = {
  id: string;
  name: string;
  country: {
    id: string;
    name: string;
    urlCode: string;
  };
  isCountry: boolean;
  isTopCity?: boolean;
  urlName: string;
  parentId: string | number;
  subregion: Subregion[];
  __typename: 'Area';
};

type Country = {
  id?: string;
  name: string;
  urlCode: string;
  topCountry: boolean;
  order?: number;
  areas?: Area[];
  __typename?: 'Country';
};

export type DropdownOption = {
  value: string;
  label: string;
  group?: string;
  country?: Country;
  isTopCity?: boolean;
};

const locationsToCities = (acc: DropdownOption[], country: Country) =>
  pipe(
    //@ts-ignore
    prop('areas'),
    map((area: Area) => ({
      label: area.name,
      value: area.name,
      country: area.country,
      group: area.country.name,
      isTopCity: area.isTopCity
    })),
    append(acc),
    flatten,
    reject(propEq('label', 'All')),
    sortBy(prop('label'))
    //@ts-ignore
  )(country);

export const generateCityOptions = (locations: LocationOptions) =>
  reduce<Country, DropdownOption[]>(
    //@ts-ignore
    locationsToCities,
    [],
    locations
  );
