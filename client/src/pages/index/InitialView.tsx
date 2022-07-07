/** @jsx jsx */
import { useLazyQuery } from '@apollo/client';
import { jsx } from '@emotion/react';
import styled from '@emotion/styled';
import axios from 'axios';
import { isToday } from 'date-fns';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { animated, config, useTransition } from 'react-spring';
import { Box, Flex, Text } from 'theme-ui';
import Typewriter from 'typewriter-effect';
import { BigButton } from '../../components/BigButton';
import { Footer } from '../../components/Footer/Footer';
import {
  defaultSearchLocation,
  LocationSelector
} from '../../components/LocationSelector/LocationSelector';
import { Message, MessageType } from '../../components/Message/Message';
import { Routes } from '../../constants/routes';
import { theme } from '../../styles/theme';
import { DropdownOption } from '../../utils/generateCityOptions';
import { getCurrentDate } from '../../utils/index';
import RandomEventQuery from './getRandomEvent.graphql';

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
    setErrorMessage('');
    setSearchLocation(selectedLocation);
  };

  const handleLocationError = (message: string) => setErrorMessage(message);

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

  const [isCelebrationDone, setIsCelebrationDone] = useState(false);
  const [stage, setStage] = useState(0);
  const [ps, setPs] = useState(false);

  if (!isCelebrationDone && isToday(new Date())) {
    return (
      <CongratsContainer>
        <Container css={{ padding: '32px' }}>
          {stage === 0 && (
            <Typewriter
              onInit={typewriter => {
                typewriter
                  .typeString('Ou, hey Andy! 👋')
                  .pauseFor(2500)
                  .callFunction(() => {
                    setStage(1);
                  })
                  .start();
              }}
            />
          )}

          {stage === 1 && (
            <Typewriter
              onInit={typewriter => {
                typewriter
                  .typeString('Just wanted to tell you that...')
                  .pauseFor(2500)
                  .typeString(' I am really happy to have you in my life!')
                  .pauseFor(2500)
                  .callFunction(() => {
                    setStage(2);
                  })
                  .start();
              }}
            />
          )}

          {stage === 2 && (
            <Typewriter
              onInit={typewriter => {
                typewriter
                  .typeString(' And also that...')
                  .pauseFor(2500)
                  .typeString(
                    ' I appreciate our friendship deep to my core ❤❤❤'
                  )
                  .pauseFor(2500)
                  .callFunction(() => {
                    setStage(3);
                  })
                  .start();
              }}
            />
          )}

          {stage === 3 && (
            <div>
              <Typewriter
                onInit={typewriter => {
                  typewriter
                    .typeString('🥳🥳  HAPPY BIRTHDAY BUDDY 🥳🥳')
                    .pauseFor(4000)
                    .callFunction(() => {
                      setStage(4);
                      setPs(true);
                    })
                    .start();
                }}
              />
            </div>
          )}

          {ps && (
            <Typewriter
              onInit={typewriter => {
                typewriter
                  .typeString(
                    '<small>P.S. Remember to click an artist name 😉</small>'
                  )
                  .pauseFor(2500)
                  .callFunction(() => {
                    setIsCelebrationDone(true);
                  })
                  .start();
              }}
            />
          )}
        </Container>
      </CongratsContainer>
    );
  }

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
          onError={handleLocationError}
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
          css={{ padding: '2rem', textAlign: 'center', whiteSpace: 'pre-line' }}
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

const CongratsContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  background-image: linear-gradient(
    to bottom,
    #12151f,
    #121521,
    #121524,
    #121526,
    #121528
  );
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
