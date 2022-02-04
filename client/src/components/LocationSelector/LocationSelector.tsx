import { isEmpty, prop, uniqBy } from 'ramda';
import React, { useEffect, useState } from 'react';
import { BiCurrentLocation } from 'react-icons/bi';
import { Box, Divider, Flex } from 'theme-ui';
import { cityOptions } from '../../constants/cityOptions';
import { useDeviceLocation } from '../../hooks/useDeviceLocation';
import { DropdownOption } from '../../utils/generateCityOptions';
import { Select } from '../Select';

type LocationSelectorProps = {
  onChange: (cityOption: DropdownOption) => void;
  onError?: (message: string) => void;
  locatorIconPosition?: 'start' | 'end';
  className?: string;
};

export const defaultSearchLocation = {
  value: 'Berlin',
  label: 'Berlin',
  isTopCity: true,
  country: {
    id: '12',
    name: 'Germany',
    urlCode: 'de',
    topCountry: true
  }
};

export const LocationSelector = ({
  onChange,
  onError,
  locatorIconPosition = 'start',
  className
}: LocationSelectorProps) => {
  const {
    deviceLocation,
    getLocation,
    isLoading: isLoadingLocation,
    error: geolocationError
  } = useDeviceLocation();

  const [searchLocation, setSearchLocation] = useState<
    DropdownOption | undefined
  >(defaultSearchLocation);

  useEffect(() => {
    /**
     * When useDeviceLocation yields data, we convert the device location data into a dropdown option,
     * and store this as "search-location" in local storage.
     * Next time when LocationSelector mounts, "search-location" is retrieved from local storage,
     * and used as a preselection for dropdowns as well as searches.
     */
    if (!isLoadingLocation && deviceLocation) {
      const deviceLocationDropdownOption = cityOptions.find(
        city => city.label.toLowerCase() === deviceLocation.city
      );

      if (deviceLocationDropdownOption) {
        localStorage.setItem(
          'search-location',
          JSON.stringify(deviceLocationDropdownOption)
        );

        setSearchLocation(deviceLocationDropdownOption);
      } else if (onError) {
        onError(
          'Your location has no events :(\nTry choosing another location!'
        );
      }
    }
  }, [deviceLocation, isLoadingLocation]);

  useEffect(() => {
    const storedSearchLocation = localStorage.getItem('search-location');

    /**
     * When the view mounts, we first check if user have previously chosen a search location from the dropdown.
     * If yes, then we use this search location again.
     * If there is no stored search-location, we take the device location and set it to be the search location.
     *
     * Local storage search-location will always be favored before device location
     */
    if (storedSearchLocation) {
      setSearchLocation(JSON.parse(storedSearchLocation));
    } else {
      getLocation();
    }
  }, []);

  /**
   * Here we propagate each local searchLocal change to the parent.
   */
  useEffect(() => {
    if (searchLocation && !isEmpty(searchLocation)) {
      onChange(searchLocation);
    }
  }, [searchLocation]);

  const handleCitySelection = (selectedLocation: string) => {
    const cityOption = cityOptions.find(
      city => city.label.toLowerCase() === selectedLocation.toLowerCase()
    );

    localStorage.setItem('search-location', JSON.stringify(cityOption));
    setSearchLocation(cityOption);
  };

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

  const disabledStyle: React.CSSProperties = {
    pointerEvents: 'none',
    opacity: 0.7
  };

  return (
    <Box>
      <Flex
        className={className}
        css={{ alignItems: 'center', margin: '1rem 0' }}
      >
        {locatorIconPosition === 'start' && (
          <>
            <BiCurrentLocation
              onClick={getLocation}
              style={geolocationError ? disabledStyle : {}}
            />
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
              onChange={handleCitySelection}
              value={searchLocation}
              isLoading={isLoadingLocation}
              isGrouped
            />
          </>
        )}
        {locatorIconPosition === 'end' && (
          <>
            <Select
              options={groupedCities}
              onChange={handleCitySelection}
              value={searchLocation}
              isLoading={isLoadingLocation}
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
            <BiCurrentLocation
              onClick={getLocation}
              style={geolocationError ? disabledStyle : {}}
            />
          </>
        )}
      </Flex>
    </Box>
  );
};
