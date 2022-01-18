/** @jsx jsx */
import { BigButton } from '../../components/BigButton';
import { Footer } from '../../components/Footer/Footer';
import {
  LocationSelector,
  defaultSearchLocation
} from '../../components/LocationSelector/LocationSelector';
import { Message, MessageType } from '../../components/Message/Message';
import { Routes } from '../../constants/routes';
import { theme } from '../../styles/theme';
import { DropdownOption } from '../../utils/generateCityOptions';
import { getCurrentDate } from '../../utils/index';
import { RandomEventQuery } from './getRandomEvent';
import { useLazyQuery } from '@apollo/client';
import { css, jsx } from '@emotion/react';
import styled from '@emotion/styled';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { animated, config, useTransition } from 'react-spring';
import { Box, Flex, Text, Divider } from 'theme-ui';

declare global {
  interface Window {
    Navigator: {
      standalone: string;
    };
  }
}

export const InitialView = () => {
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [getRandomEvent] = useLazyQuery(RandomEventQuery);
  const [searchLocation, setSearchLocation] = useState<DropdownOption>(
    defaultSearchLocation
  );
  const navigate = useNavigate();

  const getScEmbedCode = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await getRandomEvent({
        variables: {
          country: searchLocation?.country.urlCode.toLowerCase() ?? 'de',
          city:
            searchLocation?.value.toLowerCase().replace(/\s+/g, '') ?? 'berlin',
          date: getCurrentDate()
        }
      });

      navigate(Routes.Results, { state: response.data });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setErrorMessage('No events found for given location. Try another one!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCitySelection = (selectedLocation: DropdownOption) => {
    setSearchLocation(selectedLocation);
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
        <Text css={{ fontSize: theme.fontSizes[1], marginRight: '0.8rem' }}>
          Raving in
        </Text>
        <LocationSelector
          onChange={handleCitySelection}
          locatorIconPosition="end"
          css={{
            fontSize: theme.fontSizes[1]
          }}
        />
      </Flex>
      {errorMessage && (
        <Message
          type={MessageType.Error}
          size="small"
          css={{ padding: '2rem' }}
        >
          {errorMessage}
        </Message>
      )}
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
