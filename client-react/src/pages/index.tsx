import React, { useState } from 'react'
import {BigButton} from "../components/BigButton";
import { format } from 'date-fns'
import { api } from "../api";
import styled from '@emotion/styled';

declare global {
  interface Window {
    Navigator: {
      standalone: string
    }
  }
}

type EventInformation = {
  eventLink: string,
  venue: string,
  title: string,
  date: string,
  openingHours: string,
}

export const MainView = () => {
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [scEmbedCode, setScEmbedCode] = useState('')
  const [raEventInformation, setRaEventInformation] = useState<EventInformation | undefined>(undefined)

  const isStandalonePWARequest = () => {
    const isPWAiOS =
      //@ts-ignore
      "standalone" in window.navigator && window.navigator["standalone"];
    const isPWAChrome = window.matchMedia("(display-mode: standalone)").matches;

    return isPWAiOS || isPWAChrome;
  };


  const getCurrentDate = () => format(new Date(), 'yyyy-MM-dd')

  const getScEmbedCode = async () => {
    setIsLoading(true)
    setErrorMessage('')

    const isAutoPlayPossible = isStandalonePWARequest();
    
    // location is currently hard-coded
    const location = 'berlin'
    const date = getCurrentDate();

    try {
      console.log('getting')
      const response = await api(
        "GET",
        `random-soundcloud-track?location=${location}&date=${date}&autoPlay=${isAutoPlayPossible}`
      );
      setScEmbedCode(response.body.html)
      setRaEventInformation(response.body);
    } catch (error) {
      setErrorMessage(error as string)
    } finally {
      setIsLoading(false)
    }
  };
  return (
    <Container>
      <div className="full-width-container">
        {scEmbedCode && (
          <div className="soundcloud-embedded-player">
            <div className="player" dangerouslySetInnerHTML={{ __html: scEmbedCode }} />
            {raEventInformation && (
              <div className="event-info-container">
                <div className="column">
                  <span className="event-info-heading">Event</span>
                  <a
                    className="event-info-row"
                    href={raEventInformation.eventLink}
                    target="_blank">{raEventInformation.title}</a
                  >
                  <span className="event-info-heading">Venue</span>
                  <a
                    className="event-info-row"
                    href={raEventInformation.venue}
                    target="_blank">{raEventInformation.venue}</a
                  >
                </div>
                <div className="column">
                  <span className="event-info-heading">Date</span>
                  <span className="event-info-row date">{raEventInformation.date}</span>
                  <span className="event-info-row">{raEventInformation.openingHours}</span
                  >
                </div>
              </div>
            )}
        </div>
        )}
        <BigButton onClick={getScEmbedCode} isSmall={!!scEmbedCode} isLoading={isLoading} />
        {errorMessage && (
          <span>{errorMessage}</span>
        )}
        <span className="copyright">(c) Andrew Moore & Sampo Lahtinen</span>
      </div>
    </Container>
  )
}

const Container = styled.div`
  .event-info-container {
      display: flex;
      padding: 16px;
      background-color: hsl(231deg 24% 15%);
      text-align: left;
    }

    .event-info-heading {
      display: block;
      color: white;
      opacity: 0.7;
      font-size: 8px;
      font-weight: 200;
    }
    .event-info-row {
      text-decoration: none;
      color: white;
      font-size: 10px;
      text-align: left;
      margin-bottom: 16px;
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

    .full-width-container {
      display: flex;
      flex-direction: column;
      align-items: center;
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
`
