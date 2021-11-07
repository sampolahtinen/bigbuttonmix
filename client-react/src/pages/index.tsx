/** @jsx jsx */
import { jsx } from '@emotion/react';
import React, { useState } from 'react';
import { BigButton } from '../components/BigButton';
import { format } from 'date-fns';
import { api } from '../api';
import styled from '@emotion/styled';
import { Box } from '@theme-ui/components';

const wait = (time = 100) =>
  new Promise(resolve => {
    setTimeout(() => resolve('ok'), time);
  });

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

export const MainView = () => {
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [scEmbedCode, setScEmbedCode] = useState('');
  const [raEventInformation, setRaEventInformation] = useState<
    EventInformation | undefined
  >(undefined);

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

    // location is currently hard-coded
    const location = 'berlin';
    const date = getCurrentDate();

    try {
      const response = await api(
        'GET',
        `random-soundcloud-track?location=${location}&date=${date}&autoPlay=${isAutoPlayPossible}`
      );

      setScEmbedCode(response.body.html);
      setRaEventInformation(response.body);
    } catch (error) {
      setErrorMessage(error as string);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Container>
      {scEmbedCode && (
        <div className="soundcloud-embedded-player">
          <div
            className="player"
            dangerouslySetInnerHTML={{ __html: scEmbedCode }}
          />
          {raEventInformation && (
            <div className="event-info-container">
              <div className="column" css={{ marginRight: '1rem' }}>
                <Row className="row">
                  <span className="event-info-heading">Event</span>
                  <a
                    className="event-info-row"
                    href={raEventInformation.eventLink}
                    target="_blank"
                  >
                    {raEventInformation.title}
                  </a>
                </Row>
                <Row>
                  <span className="event-info-heading">Venue</span>
                  <a
                    className="event-info-row"
                    href={raEventInformation.venue}
                    target="_blank"
                  >
                    {raEventInformation.venue}
                  </a>
                </Row>
              </div>
              <div className="column">
                <Row>
                  <span className="event-info-heading">Date</span>
                  <span className="event-info-row date">
                    {raEventInformation.date}
                  </span>
                </Row>
                <Row>
                  <span className="event-info-row">
                    {raEventInformation.openingHours}
                  </span>
                </Row>
              </div>
            </div>
          )}
        </div>
      )}
      <BigButton
        css={{ paddingTop: !!scEmbedCode ? '3rem' : '' }}
        onClick={getScEmbedCode}
        isSmall={!!scEmbedCode}
        isLoading={isLoading}
      />
      {errorMessage && <span>{errorMessage}</span>}
      <span className="copyright">(c) Andrew Moore & Sampo Lahtinen</span>
    </Container>
  );
};

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
