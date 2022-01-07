import { gql } from '@apollo/client';

export const RandomEventQuery = gql`
  query($country: String!, $city: String!, $date: String!) {
    randomEvent(country: $country, city: $city, date: $date) {
      id
      title
      eventUrl
      venue
      address
      date
      openingHours
      artists {
        id
        name
        soundcloudUrl
      }
      randomTrack {
        track_url
        widget_src
        author_url
        description
        thumbnail_url
        title
      }
    }
  }
`;
