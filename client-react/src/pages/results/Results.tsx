/** @jsx jsx */
import { jsx } from '@emotion/react';
import React, { useEffect, useState } from 'react';
import { BigButton } from '../../components/BigButton';
import { format } from 'date-fns';
import { api } from '../../api';
import styled from '@emotion/styled';
import { Select } from '../../components/Select/Select';
import { cityOptions } from '../../constants/cityOptions';
import { DropdownOption } from '../../utils/generateCityOptions';
import { useLocation } from 'react-router';
import { Footer } from '../../components/Footer/Footer';

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

export const Results = () => {
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [scEmbedCode, setScEmbedCode] = useState('');
  const location = useLocation();

  const [searchLocation, setSearchLocation] = useState<
    DropdownOption | undefined
  >(undefined);

  const [raEventInformation, setRaEventInformation] = useState<
    EventInformation | undefined
  >(undefined);

  useEffect(() => {
    const storedSearchLocation = localStorage.getItem('search-location');

    if (storedSearchLocation) {
      setSearchLocation(JSON.parse(storedSearchLocation));
    }
  }, []);

  useEffect(() => {
    if (location.state) {
      setScEmbedCode(location.state.html);
      setRaEventInformation(location.state);
      setIsLoading(false);
    }
  }, [location]);

  const isStandalonePWARequest = () => {
    const isPWAiOS =
      //@ts-ignore
      'standalone' in window.navigator && window.navigator['standalone'];
    const isPWAChrome = window.matchMedia('(display-mode: standalone)').matches;

    return isPWAiOS || isPWAChrome;
  };

  const getCurrentDate = () => format(new Date(), 'yyyy-MM-dd');

  const getScEmbedCode = async () => {
    setIsLoading(true);
    setErrorMessage('');

    const isAutoPlayPossible = isStandalonePWARequest();
    const date = getCurrentDate();

    try {
      const response = await api(
        'GET',
        `random-soundcloud-track?country=${searchLocation?.country.urlCode.toLowerCase()}&city=${searchLocation?.value.toLowerCase()}&date=${date}&autoPlay=${isAutoPlayPossible}`
      );

      setScEmbedCode(response.body.html);
      setRaEventInformation(response.body);
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

  const deviceLocation = cityOptions.find(
    city => city.label.toLowerCase() === 'berlin'
  );

  return (
    <Container>
      {scEmbedCode && (
        <div className="soundcloud-embedded-player">
          <Player
            className="player"
            dangerouslySetInnerHTML={{ __html: scEmbedCode }}
          />
          {raEventInformation && (
            <EventInfoContainer className="event-info-container">
              <div className="column" css={{ marginRight: '1rem' }}>
                <Row className="row">
                  <Heading>Event</Heading>
                  <Anchor
                    as="a"
                    className="event-info-row"
                    href={raEventInformation.eventLink}
                    target="_blank"
                  >
                    {raEventInformation.title}
                  </Anchor>
                </Row>
                <Row>
                  <Heading>Venue</Heading>
                  <Text className="event-info-row">
                    {raEventInformation.venue}
                  </Text>
                </Row>
              </div>
              <div className="column">
                <Row>
                  <Heading>Date</Heading>
                  <DateText>{raEventInformation.date}</DateText>
                </Row>
                <Row>
                  <Text>{raEventInformation.openingHours}</Text>
                </Row>
              </div>
            </EventInfoContainer>
          )}
        </div>
      )}
      {scEmbedCode && (
        <Select
          options={cityOptions}
          onChange={handleCitySelection}
          defaultValue={searchLocation || deviceLocation}
        />
      )}
      <BigButton
        css={{ paddingTop: '3rem', margin: 0 }}
        onClick={getScEmbedCode}
        isSmall
        isLoading={isLoading}
      />
      {errorMessage && <span>{errorMessage}</span>}
      <Footer />
    </Container>
  );
};

const Player = styled.div`
  height: 400px;
`;

const Row = styled.div`
  margin-bottom: 1rem;
`;

const Heading = styled.span`
  display: block;
  color: #e8e5e5;
  opacity: 0.8;
  font-size: 1.2rem;
  font-weight: 200;
`;

const Text = styled.span`
  font-family: 'bold';
  text-decoration: none;
  color: white;
  font-size: 1.2rem;
  text-align: left;
  margin-bottom: 32px;
`;

const Anchor = styled.a`
  color: ${props => props.theme.colors.orange};
  font-size: 1.2rem;
  text-align: left;
  margin-bottom: 32px;
  font-family: 'bold';
  text-decoration: none;
`;

const DateText = styled(Text)`
  display: block;
  white-space: nowrap;
  margin-bottom: 0;
`;

const EventInfoContainer = styled.div`
  display: flex;
  padding: 16px;
  background-color: hsl(231deg 24% 15%);
  text-align: left;
  border-bottom-right-radius: 32px;
  border-bottom-left-radius: 32px;
  box-shadow: rgb(0 0 0 / 0%) 0px 14px 28px, rgb(0 0 0 / 14%) 0px 10px 16px;
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
