import React from 'react';
import { StylesConfig } from 'react-select';
import { DropdownOption } from '../../utils/generateCityOptions';
import { BiCurrentLocation } from 'react-icons/bi';
import { Select } from '../Select';
import { Flex, Divider } from 'theme-ui';
import { cityOptions } from '../../constants/cityOptions';
import { uniqBy, prop } from 'ramda';

type LocationSelectorProps = {
  onChange: any;
  selectedValue?: DropdownOption;
  styles?: StylesConfig;
  onCurrentLocationClick: () => void;
  isLoading?: boolean;
  locatorIconPosition?: 'start' | 'end';
  className?: string;
};

export const LocationSelector = ({
  onChange,
  selectedValue,
  onCurrentLocationClick,
  styles = {},
  isLoading,
  locatorIconPosition = 'start',
  className
}: LocationSelectorProps) => {
  const groupedCities = [
    {
      groupLabel: 'Top cities',
      list: cityOptions.filter(city => city.isTopCity)
    },
    {
      groupLabel: 'All',
      list: uniqBy(prop('value'), cityOptions)
    }
  ];
  return (
    <Flex
      className={className}
      css={{ alignItems: 'center', margin: '1rem 0' }}
    >
      {locatorIconPosition === 'start' && (
        <>
          <BiCurrentLocation onClick={onCurrentLocationClick} />
          <Divider
            css={{
              width: '1px',
              height: '16px',
              backgroundColor: 'white',
              margin: '0 1rem'
            }}
          />
          <Select
            options={groupedCities}
            onChange={onChange}
            value={selectedValue}
            isLoading={isLoading}
            isGrouped
          />
        </>
      )}
      {locatorIconPosition === 'end' && (
        <>
          <Select
            options={groupedCities}
            onChange={onChange}
            value={selectedValue}
            isLoading={isLoading}
            isGrouped
          />
          <Divider
            css={{
              width: '1px',
              height: '16px',
              backgroundColor: 'white',
              margin: '0 1rem'
            }}
          />
          <BiCurrentLocation onClick={onCurrentLocationClick} />
        </>
      )}
    </Flex>
  );
};
