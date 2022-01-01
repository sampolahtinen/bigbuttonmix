/** @jsx jsx */
import React from 'react';
import { jsx } from '@emotion/react';
import { DropdownOption } from '../../utils/generateCityOptions';
import styled from '@emotion/styled';
import { Box, Spinner } from 'theme-ui';

type SelectProps = {
  options: DropdownOption[];
  onChange: any;
  value?: DropdownOption;
  isLoading?: boolean;
  className?: string;
};

export const Select = ({
  options,
  onChange,
  value,
  isLoading,
  className
}: SelectProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };
  return (
    <Box
      css={{
        display: 'flex',
        justifyContent: 'flex-start',
        width: '120px',
        height: '16px',
        alignItems: 'center'
      }}
    >
      {isLoading ? (
        <Spinner size={20} />
      ) : (
        <StyledSelect
          className={className}
          onChange={handleChange}
          value={value?.label}
        >
          {options.map(option => (
            <option value={option.value}>{option.label}</option>
          ))}
        </StyledSelect>
      )}
    </Box>
  );
};

const StyledSelect = styled.select`
  color: white;
  background: none;
  border: none;
  width: 100%;
`;
