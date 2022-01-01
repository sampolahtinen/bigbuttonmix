/** @jsx jsx */
import React from 'react';
import { jsx } from '@emotion/react';
import { DropdownOption } from '../../utils/generateCityOptions';
import styled from '@emotion/styled';
import { Box, Spinner } from 'theme-ui';

type GroupedDropdownOption = {
  groupLabel: string;
  list: DropdownOption[];
};

type SelectProps = {
  options: DropdownOption[] | GroupedDropdownOption[];
  onChange: any;
  value?: DropdownOption;
  isLoading?: boolean;
  isGrouped?: boolean;
  className?: string;
};

export const Select = ({
  options,
  onChange,
  value,
  isLoading,
  isGrouped,
  className
}: SelectProps) => {
  if (isGrouped) {
    options as GroupedDropdownOption[];
  }
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
          {isGrouped
            ? (options as GroupedDropdownOption[]).map(group => (
                <optgroup label={group.groupLabel}>
                  {group.list.map(option => (
                    <option value={option.value}>{option.label}</option>
                  ))}
                </optgroup>
              ))
            : (options as DropdownOption[]).map(option => (
                <option value={option.value}>{option.label}</option>
              ))}
        </StyledSelect>
      )}
    </Box>
  );
};

const StyledSelect = styled.select`
  color: ${props => props.theme.colors.text};
  background: none;
  border: none;
  width: 100%;
  line-height: 1.5;
  font-weight: 400;
  font-size: ${({ theme }) => theme.fontSizes[1] + 'px'};
`;
