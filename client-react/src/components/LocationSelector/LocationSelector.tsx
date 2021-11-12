import React from 'react';
import { StylesConfig } from 'react-select';
import { DropdownOption } from '../../utils/generateCityOptions';
import { BiCurrentLocation } from 'react-icons/bi';
import { Select } from '../Select';
import { Flex, Divider } from 'theme-ui';

type LocationSelectorProps = {
  options: DropdownOption[];
  onChange: any;
  selectedValue?: DropdownOption;
  styles?: StylesConfig;
  onCurrentLocationClick: () => void;
  isLoading?: boolean;
};

export const LocationSelector = ({
  options,
  onChange,
  selectedValue,
  onCurrentLocationClick,
  styles = {},
  isLoading
}: LocationSelectorProps) => {
  return (
    <Flex css={{ alignItems: 'center' }}>
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
        options={options}
        onChange={onChange}
        style={{
          ...styles,
          valueContainer: provided => ({ ...provided, paddingTop: 0 })
        }}
        value={selectedValue}
        isLoading={isLoading}
      />
    </Flex>
  );
};
