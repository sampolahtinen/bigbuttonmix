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
import { Box, Flex, Text } from 'theme-ui';
import { theme } from '../../styles/theme';
import { animated, config, useTransition } from 'react-spring';
import { useNavigate } from 'react-router';
import { Routes } from '../../constants/routes';
import { Footer } from '../../components/Footer/Footer';

declare global {
  interface Window {
    Navigator: {
      standalone: string;
    };
  }
}

export const Initial = () => {
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounting, setIsMounting] = useState(true);

  const [searchLocation, setSearchLocation] = useState<
    DropdownOption | undefined
  >(undefined);

  const navigate = useNavigate();

  useEffect(() => {
    const storedSearchLocation = localStorage.getItem('search-location');
    const deviceLocation = localStorage.getItem('device-location');
    console.log(deviceLocation);

    if (deviceLocation) {
      const deviceLocationDropdownOption = cityOptions.find(
        city => city.label.toLowerCase() === JSON.parse(deviceLocation).city
      );
      console.log(deviceLocationDropdownOption);

      setSearchLocation(deviceLocationDropdownOption);
    }
    setIsMounting(false);
    // if (storedSearchLocation) {
    //   setSearchLocation(JSON.parse(storedSearchLocation));
    // }
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

      navigate(Routes.Results, { state: response.data });
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
      transform: 'translate3d(0, 50%, 0) scale(0.8)'
    },
    enter: {
      opacity: 1,
      transform: 'translate3d(0, 0%, 0) scale(1)'
    },
    leave: {
      opacity: 0,
      transform: 'translate3d(0, -100%, 0) scale(0)'
    },
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
        css={{ margin: '8rem 0' }}
        onClick={getScEmbedCode}
        isLoading={isLoading}
        isBreathingEnabled
      />
      <Flex css={{ alignItems: 'center' }}>
        <Text css={{ fontSize: theme.fontSizes[0] }}>Raving in</Text>
        {!isMounting && (
          <Select
            options={cityOptions}
            onChange={handleCitySelection}
            defaultValue={searchLocation}
            style={selectStyles}
          />
        )}
      </Flex>
      {errorMessage && <span>{errorMessage}</span>}
      <Footer />
    </Container>
  );
};

const Title = styled.h1`
  font-size: 1.6rem;
  margin: 0;
  color: 'white';
  font-family: 'bold';
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
