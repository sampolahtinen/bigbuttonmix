import { gql } from '@apollo/client';

export const RandomSoundcloudTrack = gql`
  query ($soundcloudUrl: String!) {
    randomSoundcloudTrack(soundcloudUrl: $soundcloudUrl) {
      track_url
      widget_src
      author_url
      description
      thumbnail_url
      title
    }
  }
`;
