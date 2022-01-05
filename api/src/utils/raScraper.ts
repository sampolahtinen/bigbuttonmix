import { DataSource } from 'apollo-datasource';
import axios from 'axios';
import shuffle from 'shuffle-array';
import { ErrorMessages, RETRY_LIMIT, REDIS_ENABLED } from '../constants';
import {
  EventArgs,
  RandomEventResponse,
  Location,
  EventMetaInfo
} from '../typeDefs';
import { Crawler } from './Crawler';
import { logSuccess, logError, logInfo, logWarning } from './logger';
import { redisClient } from '../server';
import {
  EventArtist,
  EventDetails,
  SoundCloudOembedResponse
} from '../typeDefs';
import { isEmpty } from 'ramda';

enum Step {
  'GetEvents',
  'GetEventDetails',
  'GetArtistSoundCloudLink',
  'GetSoundCloudTracks',
  'GenerateSoundCloudEmbed',
  'Done'
}

/**
 *
 * @param time string - milliseconds
 * @returns Promise: string
 */
const wait = async (time: number = 100): Promise<string> =>
  new Promise(resolve =>
    setTimeout(() => {
      resolve('ók');
    }, time)
  );

export class RaScraper extends DataSource {
  crawler: Crawler;
  retryCount: number;
  step: Step;
  events: EventDetails['id'][];
  randomEventDetails: EventDetails;
  scLink: string;
  artistSoundCloudTracks: string[];

  constructor(crawler: Crawler) {
    super();
    this.crawler = crawler;
    this.retryCount = 0;
    this.step = Step.GetEvents;
    this.events = [];
    this.randomEventDetails;
    this.scLink = '';
    this.artistSoundCloudTracks = [];
  }

  private goTo(step: Step) {
    this.step = step;
  }

  private done() {
    logSuccess('>> DONE <<');

    this.step = Step.Done;
  }

  public async getEvents(location: Location, date: string): Promise<string[]> {
    const url = `https://ra.co/events/${location.country}/${location.city}?week=${date}`;

    if (REDIS_ENABLED) {
      const cachedEvents = await redisClient.get(url);
      if (cachedEvents) {
        logInfo(`Using cached events for ${url}`);
        logInfo(`Total events: ${JSON.parse(cachedEvents).length}`);
        return JSON.parse(cachedEvents);
      }
    }

    const events = await this.crawler.scrape<string[]>(
      url,
      'h3 > a[href^="/events"]',
      (elements: Element[]): string[] =>
        elements.map(e => e.getAttribute('href'))
    );

    return events;
  }

  public async getEventDetails(eventId: string) {
    const url = `https://ra.co${eventId}`;

    if (REDIS_ENABLED) {
      const cachedEventDetails = await redisClient.get(url);

      if (cachedEventDetails) {
        // to do: put an error catching in here so it goes to an external request
        logInfo(`Using cached eventDetails for ${eventId}`);

        return JSON.parse(cachedEventDetails);
      }
    }

    const artists = await this.crawler.scrape<EventArtist[]>(
      url,
      'a > span[href^="/dj"]',
      elements =>
        elements.map(elem => ({
          name: elem.textContent,
          id: elem.getAttribute('href')
        }))
    );

    if (artists.length == 0) {
      const message = 'No artists found in event page: ' + url;
      logWarning(message);
    }

    const page = await this.crawler.getPage();
    const title = await page.title();

    const metaInfo = await page.$$eval<EventMetaInfo>(
      '[data-tracking-id=event-detail-bar] span',
      (elements: Element[]) => {
        const metaArray = elements.map(element => element.textContent);
        return {
          venue: metaArray[1],
          address: metaArray[2],
          date: metaArray[4],
          openingHours: `${metaArray[5]} - ${metaArray[7]}`
        };
      }
    );

    const eventDetails = {
      id: eventId,
      eventUrl: url,
      title,
      artists,
      ...metaInfo
    };

    /**
     * We dont wanna cache events with no artists...
     * as we cant get any music from them :)
     */
    if (REDIS_ENABLED && !isEmpty(artists)) {
      logInfo(`Caching event details: ${url}`);
      await redisClient.set(`${url}`, JSON.stringify(eventDetails));
    }

    return eventDetails;
  }

  async getArtistSoundcloudLink(artistId: string) {
    const url = `https://ra.co${artistId}`;
    const link = await this.crawler.scrape(
      url,
      'a[href^="https://www.soundcloud.com"]',
      elements => elements.map(elem => elem.getAttribute('href'))
    );

    return link[0];
  }

  async getSoundcloudEmbedCode(
    scTrackUrl: string
  ): Promise<SoundCloudOembedResponse> {
    if (REDIS_ENABLED) {
      const cachedEmbed = await redisClient.get(`${scTrackUrl}:embed`);

      if (cachedEmbed) {
        logInfo(`Using cached soundcloud embed for ${scTrackUrl}`);
        return JSON.parse(cachedEmbed);
      }
    }

    logInfo('Generating soundcloud embed');

    const soundcloudEmbedServiceUrl = 'https://soundcloud.com/oembed';
    const soundcloudEmbedResponse = await axios.get<SoundCloudOembedResponse>(
      soundcloudEmbedServiceUrl,
      {
        params: {
          url: scTrackUrl,
          format: 'json',
          auto_play: true,
          show_teaser: false
        }
      }
    );
    /**
     * Picking the src out of the iframe of oembed response
     * TODO: consider RegExp implementation
     */
    const scWidgetSrc = soundcloudEmbedResponse.data.html
      // picking src
      .split('src=')[1]
      .replace('></iframe>', '')
      .replaceAll('"', '')
      // adding extra params as sc oembed is buggy
      .replace(
        'show_artwork=true',
        'show_artwork=true&auto_play=true&show_teaser=false&hide_related=true'
      );

    soundcloudEmbedResponse.data.widget_src = scWidgetSrc;
    soundcloudEmbedResponse.data.track_url = scTrackUrl;

    if (REDIS_ENABLED) {
      await redisClient.set(
        `${scTrackUrl}:embed`,
        JSON.stringify(soundcloudEmbedResponse.data)
      );
    }

    return soundcloudEmbedResponse.data;
  }

  async getArtistSoundCloudTracks(
    artistSoundCloudUrl: string
  ): Promise<string[]> {
    if (REDIS_ENABLED) {
      const cachedTrackLinks = await redisClient.get(
        `${artistSoundCloudUrl}:tracks`
      );

      if (cachedTrackLinks) {
        logInfo(`Using cached tracks for ${artistSoundCloudUrl}`);
        return JSON.parse(cachedTrackLinks);
      }
    }

    logInfo('Requesting page from Soundcloud');

    console.time('SC tracks page');

    const scPageString = await axios.get(`${artistSoundCloudUrl}/tracks/`);

    logInfo(`Tracks page request status ${scPageString.status}`);

    console.timeEnd('SC tracks page');

    const scUserID = scPageString.data.match(/(?<=soundcloud:users:)\d+/g);
    logInfo(`scUserID ${scUserID}`);

    const client_id = 'iZIs9mchVcX5lhVRyQGGAYlNPVldzAoX';
    // We could look into a better way to manage client IDs. One option is to use the youtube api

    const api_v2_url = `https://api-v2.soundcloud.com/users/${scUserID[0]}/tracks?representation=&client_id=${client_id}&limit=20&offset=0&linked_partitioning=1&app_version=1628858614&app_locale=en`;

    /**
     * Testing of fetching soundcloud tracks via axios
     */

    const response = await axios.get(api_v2_url);

    logInfo(`Tracks api request status ${response.status}`);

    const tracks: string[] = response.data.collection.map(
      entry => entry.permalink_url
    );

    if (REDIS_ENABLED) {
      logInfo(`Caching track URLs for ${artistSoundCloudUrl}:tracks`);
      await redisClient.set(
        `${artistSoundCloudUrl}:tracks`,
        JSON.stringify(tracks)
      );
    }
    return tracks;
  }

  getRandomEvent(args: EventArgs): Promise<RandomEventResponse> {
    return new Promise(async (resolve, reject) => {
      console.log('raFunction');
      console.time('raFunction');

      let { country, city, date, autoPlay } = args;

      let location = {
        country,
        city
      };

      while (this.step !== Step.Done || this.retryCount !== RETRY_LIMIT) {
        try {
          /**
           * First step is to get ra events
           */
          if (this.step === Step.GetEvents) {
            logInfo('>> GETTING EVENTS <<');
            this.events = shuffle(await this.getEvents(location, date));

            this.goTo(Step.GetEventDetails);
          }

          /**
           * Second step is to get random event details
           */
          if (this.step === Step.GetEventDetails) {
            logInfo('>> GETTING EVENT DETAILS <<');

            const randomEvent = this.events.shift(); // shape is: /events/12345
            this.randomEventDetails = await this.getEventDetails(randomEvent);

            if (isEmpty(this.randomEventDetails.artists)) {
              this.goTo(Step.GetEventDetails);
            } else {
              logSuccess('RANDOM EVENT DETAILS SCRAPED');
              this.goTo(Step.GetArtistSoundCloudLink);
            }
          }

          /**
           * Third step is about getting random artist SoundCloud link
           */
          if (this.step === Step.GetArtistSoundCloudLink) {
            logInfo('>> GETTING RANDOM SOUNDCLOUD URL <<');

            const eventArtists = shuffle(this.randomEventDetails.artists); // Shuffle modifies original
            const randomArtist = eventArtists.shift(); // also modifies original
            this.scLink = await this.getArtistSoundcloudLink(randomArtist.id);

            if (!this.scLink) {
              logError('>> ARTIST HAS NO SOUNDCLOUD LINK');

              this.goTo(Step.GetArtistSoundCloudLink);
            } else if (!this.scLink && isEmpty(eventArtists)) {
              /**
               * If none of the event artists have soundcloud link,
               * go and pick next event
               */
              logError('>> NONE OF THE EVENT ARTISTS HAVE SOUNDCLOUD <<');

              this.goTo(Step.GetEventDetails);
            }

            logSuccess(`SOUNDCLOUD LINK: ${this.scLink}`);

            this.goTo(Step.GetSoundCloudTracks);
          }

          if (this.step === Step.GetSoundCloudTracks) {
            logInfo('>> GETTING SOUNDCLOUD TRACKS <<');

            this.artistSoundCloudTracks = shuffle(
              await this.getArtistSoundCloudTracks(this.scLink)
            );

            if (isEmpty(this.artistSoundCloudTracks)) {
              this.goTo(Step.GetArtistSoundCloudLink);
            }

            logSuccess('>> GETTING SOUNDCLOUD TRACKS <<');

            this.goTo(Step.GenerateSoundCloudEmbed);
          }

          if (this.step === Step.GenerateSoundCloudEmbed) {
            logInfo('>> GENERATING SOUNDCLOUD OEMBED <<');
            const randomTrack = this.artistSoundCloudTracks[0];

            const soundcloudOembed = await this.getSoundcloudEmbedCode(
              randomTrack
            );

            logSuccess('>> GENERATING SOUNDCLOUD OEMBED <<');
            logSuccess('>> DONE <<');

            // this.done();
            console.timeEnd('raFunction');

            return resolve({
              ...this.randomEventDetails,
              randomTrack: soundcloudOembed
            });
          }
        } catch (error) {
          console.trace();
          logError(error);

          if (error.message === ErrorMessages.NoEvents) {
            reject({
              status: 404,
              message: ErrorMessages.NoEvents
            });
          }

          if (this.retryCount < RETRY_LIMIT) {
            logError('GENERAL ERROR. RETRYING!');
            await wait(100);
            this.retryCount = this.retryCount + 1;
            this.step = 1;
          } else {
            reject({
              status: 408,
              message: 'Timeout'
            });
          }
        }
        console.timeEnd('raFunction');
      }
    });
  }
}
