import { gql } from '@apollo/client';

export const EventArtists = gql`
  query ($eventId: String!) {
    eventArtists(eventId: $eventId) {
      id
      name
      soundcloudUrl
    }
  }
`;
