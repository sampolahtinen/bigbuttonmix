import { DataSource } from 'apollo-datasource';
import axios from 'axios';
import shuffle from 'shuffle-array';
import { RETRY_LIMIT, REDIS_ENABLED } from '../constants';
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
import { ApolloError } from 'apollo-server';
import { ErrorMessages, ErrorCodes } from '../typeDefs';
import chalk from 'chalk';
import { mockRandomEventResponse } from '../__mocks__/mockRandomEventResponse';

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
  artistsWithSoundcloud: EventArtist[];

  constructor(crawler: Crawler) {
    super();
    this.crawler = crawler;
    this.retryCount = 0;
    this.step = Step.GetEvents;
    this.events = [];
    this.randomEventDetails;
    this.scLink = '';
    this.artistSoundCloudTracks = [];
    this.artistsWithSoundcloud = [];
  }

  private goTo(step: Step) {
    this.step = step;
  }

  private async isCached(key: string) {
    if (redisClient) return redisClient.exists(key);

    return false;
  }

  private async getCached(key: string) {
    logInfo(chalk.magenta(`Using cached data: ${key}`));

    const cachedData = await redisClient.get(key);

    return JSON.parse(cachedData);
  }

  private async setCacheData<T = string>(
    key: string,
    data: Record<string, string | string[] | T> | string[]
  ) {
    if (redisClient) {
      logInfo(chalk.magenta(`Caching data: ${key}`));

      await redisClient.set(key, JSON.stringify(data));

      logSuccess(chalk.magenta(`Cached data: ${key}`));
    }
  }

  public async getEvents(location: Location, date: string): Promise<string[]> {
    const url = `https://ra.co/events/${location.country}/${location.city}?week=${date}`;

    if (await this.isCached(url)) {
      return await this.getCached(url);
    }

    const events = await this.crawler.scrape<string[]>(
      url,
      'h3 > a[href^="/events"]',
      (elements: Element[]): string[] =>
        elements.map(e => e.getAttribute('href'))
    );

    await this.setCacheData(url, events);

    return events;
  }

  public async getEventDetails(eventId: string) {
    const url = `https://ra.co${eventId}`;

    if (await this.isCached(url)) {
      return await this.getCached(url);
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

    const page = await this.crawler.getPage();
    const title = await page.title();

    const metaInfo = await page.$$eval(
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

    if (artists.length == 0) {
      const message = 'No artists found in event page: ' + url;
      logWarning(message);
    } else {
      /**
       * Getting soundcloud link for each artist and adding that as a property
       */
      for (let i = 0; i < artists.length; i++) {
        const link = await this.getArtistSoundcloudLink(artists[i].id);
        artists[i].soundcloudUrl = link;
      }
    }

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
    if (!isEmpty(artists)) {
      await this.setCacheData(url, eventDetails);
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

    if (link) return link[0];

    return '';
  }

  async getSoundcloudEmbedCode(
    scTrackUrl: string
  ): Promise<SoundCloudOembedResponse> {
    if (await this.isCached(scTrackUrl)) {
      return await this.getCached(scTrackUrl);
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

    await this.setCacheData(scTrackUrl, soundcloudEmbedResponse.data);

    return soundcloudEmbedResponse.data;
  }

  async getArtistSoundCloudTracks(
    artistSoundCloudUrl: string
  ): Promise<string[]> {
    if (await this.isCached(artistSoundCloudUrl)) {
      return await this.getCached(artistSoundCloudUrl);
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

    const response = await axios.get(api_v2_url);

    logInfo(`Tracks api request status ${response.status}`);

    const tracks: string[] = response.data.collection.map(
      entry => entry.permalink_url
    );

    await this.setCacheData(artistSoundCloudUrl, tracks);

    return tracks;
  }

  getRandomEvent(args: EventArgs): Promise<RandomEventResponse> {
    return new Promise(async (resolve, reject) => {
      console.log('raFunction');
      console.time('raFunction');

      let { country, city, date } = args;

      let location = {
        country,
        city
      };

      while (this.step !== Step.Done || this.retryCount !== RETRY_LIMIT) {
        try {
          switch (this.step) {
            /**
             * First step is to get ra events
             */
            case Step.GetEvents:
              logInfo('>> GETTING EVENTS <<');
              this.events = shuffle(await this.getEvents(location, date));

              if (isEmpty(this.events)) {
                logError('>> NO EVENTS FOR GIVEN LOCATION. REJECTING <<');
                return reject(
                  new ApolloError(ErrorMessages.NoEvents, ErrorCodes.NotFound)
                );
              }

              this.goTo(Step.GetEventDetails);
            /**
             * Second step is to get random event details
             */
            case Step.GetEventDetails:
              logInfo('>> GETTING EVENT DETAILS <<');

              const randomEvent = this.events.shift(); // shape is: /events/12345
              this.randomEventDetails = await this.getEventDetails(randomEvent);

              if (isEmpty(this.randomEventDetails.artists)) {
                this.goTo(Step.GetEventDetails);
              } else {
                logSuccess(`RANDOM EVENT DETAILS SCRAPED: ${randomEvent}`);
                this.goTo(Step.GetArtistSoundCloudLink);
              }
            /**
             * Third step is about getting random artist SoundCloud link
             */
            case Step.GetArtistSoundCloudLink:
              logInfo('>> GETTING RANDOM SOUNDCLOUD URL <<');

              const eventArtists = shuffle(this.randomEventDetails.artists); // Shuffle modifies original

              this.artistsWithSoundcloud = eventArtists.filter(
                artist => artist.soundcloudUrl
              );

              if (isEmpty(this.artistsWithSoundcloud)) {
                /**
                 * If none of the event artists have soundcloud link,
                 * go and pick next event
                 */
                logError('>> NONE OF THE EVENT ARTISTS HAVE SOUNDCLOUD URL <<');

                this.goTo(Step.GetEventDetails);
              } else {
                const randomArtist = this.artistsWithSoundcloud.shift(); // also modifies original
                this.scLink = await this.getArtistSoundcloudLink(
                  randomArtist.id
                );
              }

              logSuccess(`SOUNDCLOUD LINK: ${this.scLink}`);

              this.goTo(Step.GetSoundCloudTracks);

            case Step.GetSoundCloudTracks:
              logInfo('>> GETTING SOUNDCLOUD TRACKS <<');

              this.artistSoundCloudTracks = shuffle(
                await this.getArtistSoundCloudTracks(this.scLink)
              );

              if (isEmpty(this.artistSoundCloudTracks)) {
                logError('>> ARTIST HAS NO SOUNDCLOUD TRACKS <<');

                if (isEmpty(this.artistsWithSoundcloud)) {
                  logError('>> NONE OF THE EVENT ARTISTS HAVE TRACKS <<');

                  if (isEmpty(this.events)) {
                    logError(
                      '>> NONE OF THE EVENTS HAVE ARTIST WITH SOUNDCLOUD TRACKS <<'
                    );
                    logError('>> REJECTING REQUEST <<');

                    return reject(
                      new ApolloError(
                        ErrorMessages.EventHasNoSoundcloud,
                        ErrorCodes.NotFound
                      )
                    );
                  }

                  logInfo('>> GETTING NEW EVENT <<');

                  this.goTo(Step.GetEventDetails);
                } else {
                  const randomArtist = this.artistsWithSoundcloud.shift(); // also modifies original
                  this.scLink = await this.getArtistSoundcloudLink(
                    randomArtist.id
                  );

                  this.goTo(Step.GetSoundCloudTracks);
                }
              } else {
                logSuccess('>> GETTING SOUNDCLOUD TRACKS <<');

                this.goTo(Step.GenerateSoundCloudEmbed);
              }

            case Step.GenerateSoundCloudEmbed:
              logInfo('>> GENERATING SOUNDCLOUD OEMBED <<');
              const randomTrack = this.artistSoundCloudTracks[0];

              const soundcloudOembed = await this.getSoundcloudEmbedCode(
                randomTrack
              );

              logSuccess('>> GENERATING SOUNDCLOUD OEMBED <<');
              logSuccess('>> DONE <<');

              console.timeEnd('raFunction');

              return resolve({
                ...this.randomEventDetails,
                randomTrack: soundcloudOembed
              });

            default:
          }
        } catch (error) {
          logError(error);

          if (this.retryCount < RETRY_LIMIT) {
            logError('GENERAL ERROR. RETRYING!');
            await wait(100);
            this.retryCount = this.retryCount + 1;
            this.goTo(Step.GetEventDetails);
          } else {
            reject(new ApolloError(ErrorMessages.Timeout, ErrorCodes.Timeout));
          }
        }
        console.timeEnd('raFunction');
      }
    });
  }
}
