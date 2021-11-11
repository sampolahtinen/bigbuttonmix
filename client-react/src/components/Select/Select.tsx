import React from 'react';
import ReactSelect, { Options, StylesConfig } from 'react-select';
import { DropdownOption } from '../../utils/generateCityOptions';
import { mergeDeepRight } from 'ramda';

type SelectProps = {
  options: DropdownOption[];
  onChange: any;
  defaultValue?: DropdownOption;
  style?: StylesConfig;
};

const defaultStyles = {
  control: (provided: any) => ({
    ...provided,
    backgroundColor: 'transparent',
    border: 'none'
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: '#1e202f'
  }),
  option: (provided: any) => ({
    ...provided,
    color: 'white',
    fontSize: '14px'
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
  defaultValue,
  style = {}
}: SelectProps) => {
  const styles = mergeDeepRight(defaultStyles, style) as StylesConfig;
  return (
    <ReactSelect
      options={options}
      onChange={onChange}
      styles={styles}
      defaultValue={defaultValue}
    />
  );
};
