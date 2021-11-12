import axios from 'axios';
import { isEmpty } from 'ramda';
import { Page } from 'puppeteer';
import {
  EventDetails,
  EventMetaInfo,
  RaEventDetails,
  EventArtist
} from '../types';
import { redisClient } from '../server';
import { logError, logInfo, logWarning } from './logger';
import { REDIS_ENABLED } from '../constants';

const generateRandomNumber = (max: number) => Math.floor(Math.random() * max);

const puppetRequest = async (
  page: Page,
  eventUrl: string,
  cssSelector: string,
  cb: (args: Element[]) => string[] | Record<string, string>[]
) => {
  logInfo(`Puppeteer scraping: ${eventUrl}`);
  logInfo(`Using selector: ${cssSelector}`);

  await page.goto(eventUrl);

  const elements = await page.$$eval(cssSelector, cb);

  return elements;
};

// This function fetches event links from RA and throws and error if it is empty
const getEventLinks = async (searchPageURL: string, page: Page) => {
  if (REDIS_ENABLED) {
    const cachedEvents = ((await redisClient.get(
      searchPageURL
    )) as unknown) as any;

    if (cachedEvents) {
      logInfo(`Using cached events for ${searchPageURL}`);
      logInfo(`Total events: ${JSON.parse(cachedEvents).length}`);
      return JSON.parse(cachedEvents);
    }
  }

  const events = await puppetRequest(
    page,
    searchPageURL,
    'h3 > a[href^="/events"]',
    elements => elements.map(e => e.getAttribute('href'))
  );

  logInfo('Number of events found:');
  logInfo(events.length);

  if (events.length == 0) {
    const message = 'Event list is empty';
    console.log(message);
    throw message;
  }

  if (REDIS_ENABLED) {
    await redisClient.set(searchPageURL, JSON.stringify(events));
  }
  logInfo(`Total events: ${events.length}`);
  return events;
};

const convertRSHreftoURL = async href => {
  // Converts an RS href into a URL
  const baseRaUrl = 'https://ra.co';
  const eventUrl = `${baseRaUrl}${href}`;
  return eventUrl;
};

const getRandomEvent = async (eventLinks: string[]) => {
  // Chooses a random item from the list and makes it into a URL
  const randomNumber = generateRandomNumber(eventLinks.length);
  const eventUrl = await convertRSHreftoURL(eventLinks[randomNumber]);
  return eventUrl;
};

const getSoundCloudLinkFromArtist = async (page: Page, artistUrl: string) => {
  // Reads soundcloud link from artist's RA page
  if (REDIS_ENABLED) {
    const cachedSoundCloud = ((await redisClient.get(
      artistUrl
    )) as unknown) as any;

    if (cachedSoundCloud) {
      logInfo(`Using cached soundcloud link for ${artistUrl}`);
      return cachedSoundCloud;
    }
  }

  const soundCloudLinks = await puppetRequest(
    page,
    artistUrl,
    'a[href^="https://www.soundcloud.com"]',
    elements => elements.map(elem => elem.getAttribute('href'))
  );

  if (soundCloudLinks.length == 0) {
    const message = `No soundclound link for artist ${artistUrl}`;
    console.log(message);
    throw message;
  }

  if (REDIS_ENABLED) {
    await redisClient.set(artistUrl, soundCloudLinks[0]);
    logInfo(`Caching entry for ${artistUrl}`);
  }
  return soundCloudLinks[0];
};

const getRandomEventArtistScLink = async (
  page: Page,
  eventArtists: EventArtist[]
): Promise<string> => {
  logInfo('GETTING RANDOM SOUNDCLOUD LINK');
  const eventArtistLinks = eventArtists.map(artist => artist.profileLink);
  const randomNumber = generateRandomNumber(eventArtistLinks.length);
  const randomArtist = eventArtistLinks[randomNumber];
  const baseRaUrl = 'https://ra.co';
  const randomArtistURL = baseRaUrl + randomArtist;

  if (isEmpty(eventArtistLinks)) {
    return null;
  }

  try {
    const artistSoundcloudLink = (await getSoundCloudLinkFromArtist(
      page,
      randomArtistURL
    )) as string;

    if (!artistSoundcloudLink) {
      const reducedEventArtists = eventArtists.filter(
        artist => artist.profileLink !== randomArtist
      );
      return getRandomEventArtistScLink(page, reducedEventArtists);
    }

    return artistSoundcloudLink;
  } catch (error) {
    logError('fetchRandomEventArtistScLink failed');
    console.log(error);
    const reducedEventArtists = eventArtists.filter(
      artist => artist.profileLink !== randomArtist
    );
    return getRandomEventArtistScLink(page, reducedEventArtists);
  }
};

const getRaEventDetails = async (
  page: Page,
  eventUrl: string
): Promise<EventDetails> => {
  // Read event page and get artist links and other details

  if (REDIS_ENABLED) {
    const title = ((await redisClient.get(
      `${eventUrl}:title`
    )) as unknown) as any;

    if (title) {
      // to do: put an error catching in here so it goes to an external request
      logInfo(`Using cached eventDetails for ${eventUrl}`);
      const artistsString = await redisClient.get(`${eventUrl}:artists`);
      const artists = JSON.parse(artistsString);

      const metaInfoString = await redisClient.get(`${eventUrl}:meta`);
      const metaInfo = JSON.parse(metaInfoString);

      return { title, artists, ...metaInfo };
    }
  }

  const artists = (await puppetRequest(
    page,
    eventUrl,
    'a > span[href^="/dj"]',
    elements =>
      elements.map(elem => ({
        name: elem.textContent,
        profileLink: elem.getAttribute('href')
      }))
  )) as EventArtist[];

  const title = await page.title();

  const metaInfoArray = await page.$$eval(
    '[data-tracking-id=event-detail-bar] span',
    (elements: Element[]) => {
      return elements.map(element => element.textContent);
    }
  );

  let metaInfo: EventMetaInfo = {
    venue: '',
    address: '',
    date: '',
    openingHours: ''
  };

  if (metaInfoArray.length > 0) {
    metaInfo = {
      venue: metaInfoArray[1],
      address: metaInfoArray[2],
      date: metaInfoArray[4],
      openingHours: `${metaInfoArray[5]} - ${metaInfoArray[7]}`
    };
  }

  if (artists.length == 0) {
    const message = 'No artists found in event page: ' + eventUrl;
    logWarning(message);
    //throw message
  }

  if (REDIS_ENABLED) {
    logInfo(`Caching data for event: ${eventUrl}`);
    //logInfo('Title')
    await redisClient.set(`${eventUrl}:title`, title);
    //logInfo('Artists')
    await redisClient.set(`${eventUrl}:artists`, JSON.stringify(artists));
    //logInfo('Meta')
    await redisClient.set(`${eventUrl}:meta`, JSON.stringify(metaInfo));
  }

  return { title, artists, ...metaInfo };
};

export const getRandomRaEventArtists = async (
  location: { country: string; city: string },
  date: string,
  page: Page
): Promise<RaEventDetails> => {
  try {
    const raUrl = `https://ra.co/events/${location.country}/${location.city}?week=${date}`;
    logInfo(`Searching events on ${raUrl}`);
    const eventLinks = await getEventLinks(raUrl, page);

    const randomEventPage = await getRandomEvent(eventLinks);

    let eventDetails = await getRaEventDetails(page, randomEventPage);

    while (isEmpty(eventDetails.artists)) {
      console.log('artistLinks were empty, trying again...');
      const randomEventPage = await getRandomEvent(eventLinks);
      eventDetails = await getRaEventDetails(page, randomEventPage);
    }

    const randomEventArtistSoundcloudLink = await getRandomEventArtistScLink(
      page,
      eventDetails.artists
    );

    logInfo(`ARTIST SOUNDCLOUD LINK: ${randomEventArtistSoundcloudLink}`);

    if (!randomEventArtistSoundcloudLink) {
      return getRandomRaEventArtists(location, date, page);
    }

    return {
      eventLink: randomEventPage,
      randomEventScLink: randomEventArtistSoundcloudLink,
      ...eventDetails
    };
  } catch (error) {
    logError(error);
    logError('There was an unknown general error. Fetching a new event.');
    logError(JSON.stringify(error));
    //getRandomRAEventArtistTrack(location)
  }
};

/**
 * Soundcloud scrape
 */
export const getSoundcloudTracks = async (
  scArtistLink: string
): Promise<string[]> => {
  if (REDIS_ENABLED) {
    const cachedTrackLinks = ((await redisClient.get(
      `${scArtistLink}:tracks`
    )) as unknown) as any;

    if (cachedTrackLinks) {
      logInfo(`Using cached tracks for ${scArtistLink}`);
      return JSON.parse(cachedTrackLinks);
    }
  }

  logInfo('Requesting page from Soundcloud');
  console.time('SC tracks page');
  const scPageString = await axios.get(`${scArtistLink}/tracks/`);
  logInfo(`Tracks page request status ${scPageString.status}`);
  console.timeEnd('SC tracks page');

  const scUserID = scPageString.data.match(/(?<=soundcloud:users:)\d+/g);
  logInfo(`scUserID ${scUserID}`);

  const client_id = 'iZIs9mchVcX5lhVRyQGGAYlNPVldzAoX';
  // const client_id = 'o2BWXZ9TFWJtTjM1cF9OvS5BEYPk1hBS';
  // We could look into a better way to manage client IDs. One option is to use the youtube api

  const api_v2_url = `https://api-v2.soundcloud.com/users/${scUserID[0]}/tracks?representation=&client_id=${client_id}&limit=20&offset=0&linked_partitioning=1&app_version=1628858614&app_locale=en`;

  const d2 = await axios.get('https://m.soundcloud.com/loyd/tracks');
  console.log(d2);
  const d = await axios.get(api_v2_url);
  logInfo(`Tracks api request status ${d.status}`);
  const tracks = d.data.collection.map(entry => entry.permalink_url);

  if (REDIS_ENABLED) {
    logInfo(`Caching track URLs for ${scArtistLink}:tracks`);
    await redisClient.set(`${scArtistLink}:tracks`, JSON.stringify(tracks));
  }
  return tracks;
};

export const getRandomSoundcloudTrack = async (
  scArtistLink: string
): Promise<string> => {
  const tracks = await getSoundcloudTracks(scArtistLink);
  return tracks[generateRandomNumber(tracks.length)];
};

export const generateSoundcloudEmbed = async (
  scTrackUrl: string,
  autoPlay: boolean
) => {
  if (REDIS_ENABLED) {
    const cachedEmbed = ((await redisClient.get(
      `${scTrackUrl}:embed`
    )) as unknown) as any;

    if (cachedEmbed) {
      logInfo(`Using cached soundcloud embed for ${scTrackUrl}`);
      return JSON.parse(cachedEmbed);
    }
  }

  logInfo('Generating soundcloud embed');
  const soundcloudEmbedServiceUrl = 'https://soundcloud.com/oembed';
  const soundcloudEmbedResponse = await axios.get(soundcloudEmbedServiceUrl, {
    params: {
      url: scTrackUrl,
      format: 'json',
      auto_play: autoPlay || false,
      show_teaser: false
    }
  });

  if (REDIS_ENABLED) {
    await redisClient.set(
      `${scTrackUrl}:embed`,
      JSON.stringify(soundcloudEmbedResponse.data)
    );
  }

  return soundcloudEmbedResponse.data;
};
