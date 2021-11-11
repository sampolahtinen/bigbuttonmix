/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import React, { useEffect, useState } from 'react';
import { BigButton } from '../../components/BigButton';
import api from '../../api';
import styled from '@emotion/styled';
import { Select } from '../../components/Select/Select';
import { isStandalonePWARequest, getCurrentDate } from '../../utils/index';
import { cityOptions } from '../../constants/cityOptions';
import { DropdownOption } from '../../utils/generateCityOptions';
import { Box, Flex, Heading, Text } from 'theme-ui';
import { theme } from '../../styles/theme';
import { animated, config, useTransition } from 'react-spring';

declare global {
  interface Window {
    Navigator: {
      standalone: string;
    };
  }
}

type EventInformation = {
  eventLink: string;
  venue: string;
  title: string;
  date: string;
  openingHours: string;
};

export const Initial = () => {
  const deviceLocation = cityOptions.find(
    city => city.label.toLowerCase() === 'berlin'
  );

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [scEmbedCode, setScEmbedCode] = useState('');
  const [searchLocation, setSearchLocation] = useState<
    DropdownOption | undefined
  >(deviceLocation);
  const [raEventInformation, setRaEventInformation] = useState<
    EventInformation | undefined
  >(undefined);

  useEffect(() => {
    const storedSearchLocation = localStorage.getItem('search-location');

    if (storedSearchLocation) {
      setSearchLocation(JSON.parse(storedSearchLocation));
    }
  }, []);

  const getScEmbedCode = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await api.getRandomMix({
        country: searchLocation?.country.urlCode.toLowerCase(),
        city: searchLocation?.value.toLowerCase(),
        autoPlay: isStandalonePWARequest(),
        date: getCurrentDate()
      });

      setScEmbedCode(response.data.html);
      setRaEventInformation(response.data);
    } catch (error) {
      setErrorMessage(error as string);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCitySelection = (selectedLocation: DropdownOption) => {
    localStorage.setItem('search-location', JSON.stringify(selectedLocation));
    setSearchLocation(selectedLocation);
  };

  const selectStyles = {
    singleValue: (provided: any) => ({
      ...provided,
      color: theme.colors.orange,
      fontSize: theme.fontSizes[0]
    })
  };

  const animatedTextElements = [
    <Title>Tap!</Title>,
    <Title>to break free from the algorithm!</Title>
  ];

  const [index, setIndex] = useState(0);

  const transitions = useTransition(index, {
    from: {
      opacity: 0.5,
      // innerHeight: 0,
      transform: 'translate3d(0, 50%, 0) scale(0.8)'
    },
    enter: {
      opacity: 1,
      // innerHeight: 50,
      transform: 'translate3d(0, 0%, 0) scale(1)'
    },
    leave: {
      opacity: 0,
      // innerHeight: 0,
      transform: 'translate3d(0, -100%, 0) scale(0)'
    },
    // config: {
    //   duration: 3000
    // }
    config: {
      ...config.default,
      mass: 1,
      tension: 150,
      friction: 25
    }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(state => (state + 1) % animatedTextElements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Container>
      <Box
        css={{
          height: '50px',
          overflow: 'hidden',
          position: 'relative',
          width: '100%'
        }}
      >
        {/* {animatedTextElements[0]} */}
        {transitions((style, item) => (
          <animated.div
            style={style}
            css={{ position: 'absolute', textAlign: 'center', width: '100%' }}
          >
            {animatedTextElements[item]}
          </animated.div>
        ))}
      </Box>
      <BigButton
        css={{ margin: '6rem 0' }}
        onClick={getScEmbedCode}
        isSmall={!!scEmbedCode}
        isLoading={isLoading}
        isBreathingEnabled
      />
      <Flex css={{ alignItems: 'center' }}>
        <Text css={{ fontSize: theme.fontSizes[0] }}>Raving in</Text>
        <Select
          options={cityOptions}
          onChange={handleCitySelection}
          defaultValue={searchLocation || deviceLocation}
          style={selectStyles}
        />
      </Flex>
      {errorMessage && <span>{errorMessage}</span>}
      <span className="copyright">(c) Andrew Moore & Sampo Lahtinen</span>
    </Container>
  );
};

const Title = styled.h1`
  font-size: 1.2rem;
  margin: 0;
  color: 'white';
  font-family: 'bold';
`;

const Row = styled.div`
  margin-bottom: 1rem;
`;

const Container = styled.div`
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  max-width: 500px;
  background-image: linear-gradient(
    to bottom,
    #12151f,
    #121521,
    #121524,
    #121526,
    #121528
  );

  .event-info-container {
    display: flex;
    padding: 16px;
    background-color: hsl(231deg 24% 15%);
    text-align: left;
  }

  .event-info-heading {
    display: block;
    color: #e8e5e5;
    opacity: 0.8;
    font-size: 10px;
    font-weight: 200;
  }
  .event-info-row {
    text-decoration: none;
    color: white;
    font-size: 10px;
    text-align: left;
    margin-bottom: 32px;
  }

  .event-info-row.date {
    display: block;
    white-space: nowrap;
    margin-bottom: 0;
  }

  .copyright {
    font-size: 8px;
    align-self: flex-end;
    position: absolute;
    bottom: 0;
    right: 0;
    color: white;
    opacity: 0.6;
    white-space: nowrap;
  }

  .soundcloud-embedded-player {
    width: 100%;
    margin-bottom: 1rem;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }

    .full-width-container {
      margin: auto;
      max-width: 500px;
    }
  }
`;
