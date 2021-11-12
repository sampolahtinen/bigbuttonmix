import React from 'react';
import { StylesConfig } from 'react-select';
import { DropdownOption } from '../../utils/generateCityOptions';
import { BiCurrentLocation } from 'react-icons/bi';
import { Select } from '../Select';
import { Flex } from 'theme-ui';

type SelectProps = {
  options: DropdownOption[];
  onChange: any;
  defaultValue?: DropdownOption;
  styles?: StylesConfig;
};

export const LocationSelector = ({
  options,
  onChange,
  defaultValue,
  styles = {}
}: SelectProps) => {
  const handleClick = () => {};

  return (
    <Flex css={{ alignItems: 'center' }}>
      <BiCurrentLocation onClick={handleClick} />
      <Select
        options={options}
        onChange={onChange}
        style={styles}
        defaultValue={defaultValue}
      />
    </Flex>
  );
};
