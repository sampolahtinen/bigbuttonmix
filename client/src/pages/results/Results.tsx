/** @jsx jsx */
import { useLazyQuery } from '@apollo/client';
import { jsx } from '@emotion/react';
import styled from '@emotion/styled';
import axios from 'axios';
import { format } from 'date-fns';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { Box } from 'theme-ui';
import {
  Artist,
  EventInformation,
  RandomMixQueryResponse
} from '../../api/getRandomMix';
import { BigButton } from '../../components/BigButton';
import { LocationSelector } from '../../components/LocationSelector/LocationSelector';
import { Message, MessageType } from '../../components/Message/Message';
import { theme } from '../../styles/theme';
import { DropdownOption } from '../../utils/generateCityOptions';
import RandomEventQuery from '../index/getRandomEvent.graphql';
import RandomSoundcloudTrack from './getSoundcloudTrack.graphql';

declare global {
  interface Window {
    Navigator: {
      standalone: string;
    };
  }
}

export const Results = () => {
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [isLoading, setIsLoading] = useState(true);

  const [soundcloudData, setSoundcloudData] =
    useState<RandomMixQueryResponse['randomEvent']['randomTrack']>();

  const location = useLocation() as unknown as {
    state: RandomMixQueryResponse;
  };

  const [searchLocation, setSearchLocation] = useState<
    DropdownOption | undefined
  >(undefined);

  const [raEventInformation, setRaEventInformation] =
    useState<EventInformation>();

  const [raEventArtists, setRaEventArtists] = useState<Artist[]>([]);

  const [getRandomEvent, { refetch }] = useLazyQuery(RandomEventQuery);

  const [getRandomSoundcloudTrack] = useLazyQuery(RandomSoundcloudTrack, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'no-cache',
    onCompleted: ({ randomSoundcloudTrack }) => {
      setSoundcloudData(randomSoundcloudTrack);

      if (scWidget.current) {
        scWidget.current.load(randomSoundcloudTrack.track_url, {
          show_teaser: false,
          show_artwork: true,
          auto_play: true,
          hide_related: true,
          visual: true,
          callback: () => scWidget.current?.play()
        });
      }
    },
    onError: error => {
      if (error.message === 'Artist has no soundcloud page.') {
        const errorArtistId = error.graphQLErrors[0].extensions.artistId;
        if (errorArtistId) {
          setRaEventArtists(prevArtists =>
            prevArtists.map(artist => ({
              ...artist,
              hasErrors: artist.id === errorArtistId ? true : artist.hasErrors
            }))
          );
        }
      }
    }
  });

  const scWidget = useRef<SC.SoundCloudWidget>();

  const getCurrentDate = () => format(new Date(), 'yyyy-MM-dd');

  const getScEmbedCode = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await refetch({
        country: searchLocation?.country.urlCode.toLowerCase() ?? 'de',
        city:
          searchLocation?.value.toLowerCase().replace(/\s+/g, '') ?? 'berlin',
        date: getCurrentDate()
      });

      if (scWidget.current) {
        scWidget.current.pause();
      }

      const { randomTrack: soundcloudData, ...raEventInformation } =
        response.data.randomEvent;

      setSoundcloudData(soundcloudData);

      if (scWidget.current) {
        scWidget.current.load(soundcloudData.track_url, {
          show_teaser: false,
          show_artwork: true,
          auto_play: true,
          hide_related: true,
          visual: true,
          callback: () => scWidget.current?.play()
        });
      }

      setRaEventInformation(raEventInformation);
      setRaEventArtists(raEventInformation.artists);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setErrorMessage('No events found for given location. Try another one!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const parseArtistName = (url: string | null) => {
    if (url) {
      const artistName = url.match(/(?<=soundcloud.com\/).*/gm);
      if (artistName) {
        return artistName[0];
      }
    }
    return url;
  };

  const handleCitySelection = (selectedLocation: DropdownOption) => {
    setErrorMessage('');
    setSearchLocation(selectedLocation);
  };

  const handleLocationError = (message: string) => setErrorMessage(message);

  const handleGetArtistTrack = async (artistId: string) => {
    const response: any = await getRandomSoundcloudTrack({
      variables: { artistId }
    });

    if (response.data && response.data.randomSoundcloudTrack) {
      setRaEventArtists(prevArtists =>
        prevArtists.map(artist => ({
          ...artist,
          soundcloudUrl:
            artist.id === artistId
              ? response.data.randomSoundcloudTrack.author_url
              : artist.soundcloudUrl
        }))
      );
    }
  };

  useEffect(() => {
    const storedSearchLocation = localStorage.getItem('search-location');

    if (storedSearchLocation) {
      setSearchLocation(JSON.parse(storedSearchLocation));
    }
  }, []);

  /**
   * On initial render, when the data received from initial page,
   * has been stored to local state, iframe renders.
   * Once iframe has been rendered and SoundCloud widget has been mounted,
   * we can listen to READY event and trigger play.
   *
   * Once widget has been loaded, we store it to a ref for accessing it later.
   *
   * Instead of using useRef and useEffect, React docs advise to use callback
   * https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
   */
  const iframeRef = useCallback(iframe => {
    if (iframe !== null) {
      const widget = SC.Widget(iframe);
      widget.bind(SC.Widget.Events.READY, () => widget.play());
      scWidget.current = widget;
    }
  }, []);

  useEffect(() => {
    if (location.state) {
      const {
        randomTrack: soundcloudData,
        artists,
        ...raEventInformation
      } = location.state.randomEvent;

      setSoundcloudData(soundcloudData);
      console.log(raEventInformation);
      setRaEventInformation(raEventInformation);
      setRaEventArtists(artists);
      setIsLoading(false);
    }
  }, [location]);

  return (
    <React.Fragment>
      {soundcloudData?.widget_src && (
        <div
          className="soundcloud-embedded-player"
          css={{ paddingBottom: '1rem', width: '100%' }}
        >
          <Player className="player">
            <iframe
              ref={iframeRef}
              width="100%"
              height="100%"
              scrolling="no"
              frameBorder="no"
              allow="autoplay"
              src={soundcloudData.widget_src}
            ></iframe>
          </Player>
          {raEventInformation && (
            <EventInfoContainer className="event-info-container">
              <Row css={{ display: 'flex', flexWrap: 'nowrap' }}>
                <div className="column" css={{ marginRight: '1rem' }}>
                  <Row className="row">
                    <Heading>Event</Heading>
                    <Anchor
                      as="a"
                      className="event-info-row"
                      href={raEventInformation.eventUrl}
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
              </Row>
              <Row
                css={{
                  textAlign: 'center',
                  flexBasis: '100%'
                }}
              >
                <Heading>Artists</Heading>
                <Box
                  css={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                  }}
                >
                  {raEventArtists.map((artist, index) => (
                    <div>
                      <Text
                        css={{
                          color:
                            parseArtistName(artist.soundcloudUrl) ===
                            parseArtistName(soundcloudData.author_url)
                              ? theme.colors.orange
                              : theme.colors.text
                        }}
                        disabled={artist.hasErrors}
                        onClick={() => handleGetArtistTrack(artist.id)}
                      >
                        {artist.name}
                      </Text>
                      {index < raEventArtists.length - 1 && (
                        <span css={{ padding: '0 0.8rem' }}>|</span>
                      )}
                    </div>
                  ))}
                </Box>
              </Row>
            </EventInfoContainer>
          )}
        </div>
      )}
      {soundcloudData && (
        <LocationSelector
          onChange={handleCitySelection}
          onError={handleLocationError}
        />
      )}
      <BigButton
        css={{ margin: '2rem 0' }}
        onClick={getScEmbedCode}
        isSmall
        isLoading={isLoading}
      />
      {errorMessage && (
        <Message
          type={MessageType.Error}
          size="small"
          css={{ padding: '2rem', textAlign: 'center', whiteSpace: 'pre-line' }}
        >
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

const Text = styled.span<{ disabled?: boolean | null | undefined }>`
  font-family: 'bold';
  text-decoration: none;
  opacity: ${props => (props.disabled ? 0.5 : 1)};
  font-size: 1.2rem;
  text-align: left;
  margin-bottom: 32px;
  cursor: pointer;
  pointer-events: ${props => (props.disabled ? 'none' : 'all')};
`;

const Anchor = styled.a`
  color: ${props => props.theme.colors.orange};
  font-size: 1.2rem;
  text-align: left;
  margin-bottom: 32px;
  font-family: 'bold';
  text-decoration: none;
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Old versions of Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none;
`;

const DateText = styled(Text)`
  display: block;
  white-space: nowrap;
  margin-bottom: 0;
`;

const EventInfoContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 16px;
  background-color: hsl(231deg 24% 15%);
  text-align: left;
  border-bottom-right-radius: 32px;
  border-bottom-left-radius: 32px;
  box-shadow: rgb(0 0 0 / 0%) 0px 14px 28px, rgb(0 0 0 / 14%) 0px 10px 16px;
`;

const Player = styled.div`
  height: 35vh;
`;
