import { extendType, objectType, nonNull, stringArg, booleanArg } from 'nexus';

export const Artist = objectType({
  name: 'Artist',
  definition: t => {
    t.string('id', { description: 'The id of the event. FE: /events/12345' });
    t.string('name');
  }
});

export const SoundCloudMeta = objectType({
  name: 'SoundCloudMeta',
  definition: t => {
    t.string('track_url');
    t.string('widget_src');
    t.string('author_url');
    t.string('description');
    t.string('thumbnail_url');
    t.string('thumbnail_url');
    t.string('title');
  }
});

export const Event = objectType({
  name: 'Event',
  definition: t => {
    t.string('id', { description: 'The id of the event. FE: /events/12345' });
    t.string('title');
    t.string('eventUrl');
    t.string('randomEventScLink', {
      description: "Randomly picked event's artist SoundCloud link"
    });
    t.string('venue');
    t.string('address');
    t.string('date');
    t.string('openingHours');
    t.list.field('artists', {
      type: Artist
    });
    t.field('randomTrack', {
      type: SoundCloudMeta
    });
  }
});

const eventArgs = {
  country: nonNull(
    stringArg({
      description: 'country short code. For example: de,uk,fi'
    })
  ),
  city: nonNull(
    stringArg({
      description: 'city name. For example: Berlin or berlin'
    })
  ),
  date: nonNull(
    stringArg({
      description: 'Date string in format YYYY-MM-DD. For example: "2022-01-04"'
    })
  ),
  autoPlay: booleanArg({
    description: 'Will be passed to SoundCloud oembed generator'
  })
};

export const EventQuery = extendType({
  type: 'Query',
  definition: t => {
    t.field('randomEvent', {
      type: 'Event',
      args: eventArgs,
      resolve: async (_, args, ctx) =>
        ctx.dataSources.raScraper.getRandomEvent(args)
    });
  }
});
