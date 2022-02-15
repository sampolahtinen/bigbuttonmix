import React from 'react';
import { Spinner } from 'theme-ui';
import { mountWithTheme } from '../../utils/testUtils';
import { Select } from './Select';

const mockOptions = [
  {
    value: 'test1',
    label: 'test1'
  },
  {
    value: 'test2',
    label: 'test2'
  },
  {
    value: 'test3',
    label: 'test3'
  }
];

const groupedMockOptions = [
  {
    groupLabel: 'Group1',
    list: [
      {
        value: 'test1',
        label: 'test1'
      },
      {
        value: 'test2',
        label: 'test2'
      },
      {
        value: 'test3',
        label: 'test3'
      }
    ]
  }
];
describe('Select', () => {
  const mockFn = jest.fn();
  const wrapper = mountWithTheme(
    <Select options={mockOptions} onChange={mockFn} />
  );
  it('selects a value', () => {
    wrapper.find('select').simulate('click');
    wrapper
      .find('option')
      .first()
      .simulate('change', { target: { value: 'test1' } });

    expect(mockFn).toHaveBeenCalled();
  });
  it('displays a value', () => {
    wrapper.setProps({
      value: mockOptions[0]
    });

    expect(wrapper.find('select').prop('value')).toBe('test1');
  });
  it('displays a loader', () => {
    wrapper.setProps({
      isLoading: true
    });

    expect(wrapper.find(Spinner).exists()).toBeTruthy();
  });
});

describe('Select, with grouped options', () => {
  const mockFn = jest.fn();
  const wrapper = mountWithTheme(
    <Select options={groupedMockOptions} onChange={mockFn} isGrouped />
  );
  it('displays group labels', () => {
    wrapper.find('select').simulate('click');
    wrapper
      .find('option')
      .first()
      .simulate('change', { target: { value: 'test1' } });

    expect(wrapper.find('optgroup').length).toBe(1);
    expect(wrapper.find('optgroup').prop('label')).toBe('Group1');
  });
});
