import React from 'react';
import ReactSelect, { Options, StylesConfig } from 'react-select';
import { DropdownOption } from '../../utils/generateCityOptions';
import { mergeDeepRight } from 'ramda';
import { BiCurrentLocation } from 'react-icons/bi';

type SelectProps = {
  options: DropdownOption[];
  onChange: any;
  value?: DropdownOption;
  style?: StylesConfig;
  isLoading?: boolean;
};

const defaultStyles = {
  control: (provided: any) => ({
    ...provided,
    backgroundColor: 'transparent',
    // width: '100px',
    border: 'none'
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: '#1e202f',
    width: '150px'
  }),
  option: (provided: any) => ({
    ...provided,
    color: 'white',
    fontSize: '10px'
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: 'white',
    fontSize: '14px'
  }),
  indicatorSeparator: (provided: any) => ({
    ...provided,
    display: 'none'
  })
};

export const Select = ({
  options,
  onChange,
  value,
  style = {},
  isLoading
}: SelectProps) => {
  const styles = mergeDeepRight(defaultStyles, style) as StylesConfig;
  return (
    <ReactSelect
      options={options}
      onChange={onChange}
      styles={styles}
      isSearchable={false}
      value={value}
      isLoading={isLoading}
    />
  );
};
