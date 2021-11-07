import {
  append,
  assoc,
  complement,
  evolve,
  filter,
  flatten,
  groupBy,
  groupWith,
  isEmpty,
  map,
  path,
  pick,
  pipe,
  prop,
  propEq,
  props,
  reduce,
  reduceBy,
  reject
} from 'ramda';

type Subregion = {
  id: string;
  name: string;
  isCountry: boolean;
  urlName: string;
  parentId: string;
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
  urlName: string;
  parentId: number;
  subregion: Subregion[];
  __typename: 'Area';
};

type Country = {
  id: string;
  name: string;
  urlCode: string;
  topCountry: boolean;
  order: number;
  areas: Area[];
  __typename: 'Country';
};

export type DropdownOption = {
  value: string;
  label: string;
  group?: string;
  country: Country;
};

const isNotEmpty = complement(isEmpty);

const locationsToCities = (acc: DropdownOption[], country: Country) =>
  pipe(
    //@ts-ignore
    prop('areas'),
    map((area: Area) => ({
      label: area.name,
      value: area.name,
      country: area.country,
      group: area.country.name
    })),
    append(acc),
    flatten,
    reject(propEq('label', 'All'))
    //@ts-ignore
  )(country);

export const generateCityOptions = (locations: any) =>
  reduce<Country, DropdownOption[]>(
    //@ts-ignore
    locationsToCities,
    [],
    locations
  );
