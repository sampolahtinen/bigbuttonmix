### This file was generated by Nexus Schema
### Do not make changes to this file directly


type Artist {
  """The id of the event. FE: /events/12345"""
  id: String
  name: String
  soundcloudUrl: String
}

type Event {
  address: String
  artists: [Artist]
  date: String
  eventUrl: String

  """The id of the event. FE: /events/12345"""
  id: String
  openingHours: String

  """Randomly picked event's artist SoundCloud link"""
  randomEventScLink: String
  randomTrack: SoundCloudMeta
  title: String
  venue: String
}

type Query {
  eventArtists(eventId: String!): [Artist]
  randomEvent(
    """Will be passed to SoundCloud oembed generator"""
    autoPlay: Boolean

    """city name. For example: Berlin or berlin"""
    city: String!

    """country short code. For example: de,uk,fi"""
    country: String!

    """
    Date string in format YYYY-MM-DD. For example: "2022-01-04"
    """
    date: String!
  ): Event
  randomSoundcloudTrack(artistId: String, soundcloudUrl: String): SoundCloudMeta
}

type SoundCloudMeta {
  author_url: String
  description: String
  thumbnail_url: String
  title: String
  track_url: String
  widget_src: String
}
