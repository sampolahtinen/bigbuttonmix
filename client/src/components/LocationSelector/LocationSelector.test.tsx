import React from 'react';
import { BiCurrentLocation } from 'react-icons/bi';
import {
  mockNavigatorGeolocation,
  mountWithTheme,
  wait
} from '../../utils/testUtils';
import { Select } from '../Select/Select';
import { defaultSearchLocation, LocationSelector } from './LocationSelector';
import { mockRandomEventResponse } from './mockMapboxResponse';

let windowSpy = jest.spyOn(window, 'window', 'get');

beforeEach(() => {
  windowSpy = jest.spyOn(window, 'window', 'get');
});

afterEach(() => {
  windowSpy.mockRestore();
});

jest.mock('../../api/getMapboxLocation.ts', () => ({
  getMapboxLocation: () => ({ data: mockRandomEventResponse })
}));

const { getCurrentPositionMock } = mockNavigatorGeolocation();

describe('LocationSelector with access to geolocation', () => {
  getCurrentPositionMock.mockImplementation((success, rejected) =>
    success({
      coords: {
        latitude: 51.1,
        longitude: 45.3
      }
    })
  );
  const mockFn = jest.fn();
  const wrapper = mountWithTheme(<LocationSelector onChange={mockFn} />);
  it('renders device location icon', () => {
    expect(wrapper.find(BiCurrentLocation).exists()).toBeTruthy();
  });

  it('uses device location if user has granted rights to use geolocation', async () => {
    /**
     * Async waiting and updating of wrapper is needed for displaying effect results
     */
    await wait();
    wrapper.update();

    const selectComponent = wrapper.find(Select);
    const expectedValue =
      mockRandomEventResponse.features[2].place_name.split(',')[0];

    expect(selectComponent.prop('value').label).toBe(expectedValue);
  });

  it('chooses device location, if "location" icon is clicked', async () => {
    const getSelectComponent = () => wrapper.find(Select);
    /**
     * First, lets lazy trigger onChange of the Select component,
     * so that our state value gets updated
     */
    getSelectComponent().prop('onChange')('Amsterdam');
    await wait();
    wrapper.update();

    expect(getSelectComponent().prop('value').label).toBe('Amsterdam');

    /**
     * After that, lets click the device icon button,
     * and see if our Select component now displays device's location
     */
    wrapper.find(BiCurrentLocation).simulate('click');

    await wait();
    wrapper.update();

    const expectedValue =
      mockRandomEventResponse.features[2].place_name.split(',')[0];

    expect(getSelectComponent().prop('value').label).toBe(expectedValue);
  });
});

describe('LocationSelector without access to geolocation', () => {
  getCurrentPositionMock.mockImplementationOnce((success, rejected) =>
    rejected({
      code: '',
      message: '',
      PERMISSION_DENIED: '',
      POSITION_UNAVAILABLE: '',
      TIMEOUT: ''
    })
  );

  const mockFn = jest.fn();
  const wrapper = mountWithTheme(<LocationSelector onChange={mockFn} />);

  it('uses default location "Berlin" if geolocation is not available, or user denies its usage', async () => {
    /**
     * Async waiting and updating of wrapper is needed for displaying effect results
     */
    getCurrentPositionMock.mockImplementation((success, rejected) =>
      rejected({
        code: '',
        message: '',
        PERMISSION_DENIED: '',
        POSITION_UNAVAILABLE: '',
        TIMEOUT: ''
      })
    );

    await wait();
    wrapper.update();

    const selectComponent = wrapper.find(Select);
    const expectedValue = defaultSearchLocation.label;

    expect(selectComponent.prop('value').label).toBe(expectedValue);
  });
});
