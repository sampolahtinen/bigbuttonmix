import React from 'react';
import ReactSelect, { Options } from 'react-select';
import { DropdownOption } from '../../utils/generateCityOptions';

type SelectProps = {
  options: DropdownOption[];
  onChange: any;
  defaultValue?: DropdownOption;
};

const selectStyles = {
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

export const Select = ({ options, onChange, defaultValue }: SelectProps) => {
  return (
    <ReactSelect
      options={options}
      onChange={onChange}
      styles={selectStyles}
      defaultValue={defaultValue}
    />
  );
};
