import { append, assoc, complement, evolve, filter, flatten, groupBy, groupWith, isEmpty, map, path, pick, pipe, prop, propEq, props, reduce, reduceBy, reject } from "ramda"

type Subregion = {
  id: string,
  name: string,
  isCountry: boolean,
  urlName: string,
  parentId: string,
  country: {
    id: string,
    name: string,
    urlCode: string,
    __typename: string
  },
  __typename: string
}

type Area = {
  id: string,
  name: string,
  country: {
    id: string,
    name: string,
    urlCode: string,
  },
  isCountry: boolean,
  urlName: string,
  parentId: number,
  subregion: Subregion[],
  __typename: 'Area',
}

type Country = {
  id: string,
  name: string,
  urlCode: string,
  topCountry: boolean,
  order: number,
  areas: Area[],
  __typename: 'Country'
}

type DropdownOption = {
  value: string;
  label: string;
  group?: string;
};

const isNotEmpty = complement(isEmpty)

const locationsToCities = (acc, country: Country) => pipe(
  prop('areas'),
  map((area: Area) => ({ 
    label: area.name, 
    value: area.name, 
    group: area.country.name 
  })),
  append(acc),
  flatten,
  reject(propEq('label', 'All'))
)(country)

export const generateCityOptions = reduce<Country, DropdownOption[]>(locationsToCities, [])