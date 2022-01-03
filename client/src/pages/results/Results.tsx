/** @jsx jsx */
import React, { useEffect, useState } from 'react';
import { css, jsx } from '@emotion/react';
import { BigButton } from '../../components/BigButton';
import { format } from 'date-fns';
import styled from '@emotion/styled';
import { cityOptions } from '../../constants/cityOptions';
import { DropdownOption } from '../../utils/generateCityOptions';
import { useLocation } from 'react-router';
import { LocationSelector } from '../../components/LocationSelector/LocationSelector';
import { getDeviceLocation } from '../../app/App';
import api from '../../api';
import axios from 'axios';
import { Message, MessageType } from '../../components/Message/Message';
import { SoundcloudOembedResponse } from '../../api/getRandomMix';

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
  const [scEmbedCode, setScEmbedCode] = useState<SoundcloudOembedResponse>();
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
      const soundcloudSrc = location.state;

      setScEmbedCode(soundcloudSrc);
      setRaEventInformation(location.state);
      setIsLoading(false);
    }
  }, [location]);

  const getCurrentDate = () => format(new Date(), 'yyyy-MM-dd');

  const getScEmbedCode = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await api.getRandomMix({
        country: searchLocation?.country.urlCode.toLowerCase(),
        city: searchLocation?.value.toLowerCase().replace(/\s+/g, ''),
        autoPlay: true,
        date: getCurrentDate()
      });

      setScEmbedCode(response.data);

      setRaEventInformation(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setErrorMessage('No events found for given location. Try another one!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCitySelection = (selectedLocation: string) => {
    const cityOption = cityOptions.find(
      city => city.label.toLowerCase() === selectedLocation.toLowerCase()
    );
    localStorage.setItem('search-location', JSON.stringify(cityOption));
    setSearchLocation(cityOption);
  };

  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const handleSearchLocationChange = async () => {
    setIsGettingLocation(true);
    try {
      const deviceLocation = await getDeviceLocation();

      if (deviceLocation && deviceLocation.city) {
        const nextSearchLocation = cityOptions.find(
          city => city.label.toLowerCase() === deviceLocation.city
        );

        localStorage.setItem(
          'search-location',
          JSON.stringify(nextSearchLocation)
        );
        setSearchLocation(nextSearchLocation);
        setIsGettingLocation(false);
      }
    } catch (error) {
      setErrorMessage('Could not determine device location');
      setIsGettingLocation(false);
    }
  };

  return (
    <React.Fragment>
      {scEmbedCode && (
        <div
          className="soundcloud-embedded-player"
          css={{ paddingBottom: '1rem', width: '100%' }}
        >
          <Player
            className="player"
            // dangerouslySetInnerHTML={{ __html: scEmbedCode }}
          >
            <iframe
              width="100%"
              height="100%"
              scrolling="no"
              frameBorder="no"
              allow="autoplay"
              src={scEmbedCode.widgetSrc}
            ></iframe>
          </Player>
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
        <LocationSelector
          onChange={handleCitySelection}
          onCurrentLocationClick={handleSearchLocationChange}
          selectedValue={searchLocation}
          isLoading={isGettingLocation}
        />
      )}
      <BigButton
        css={{ margin: '2rem 0' }}
        onClick={getScEmbedCode}
        isSmall
        isLoading={isLoading}
      />
      {errorMessage && (
        <Message type={MessageType.Error} size="small">
          {errorMessage}
        </Message>
      )}
    </React.Fragment>
  );
};

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

const Player = styled.div`
  height: 45vh;
`;
