import axios from "axios";
import { isEmpty } from "ramda";
import { Page } from "puppeteer";
import {
  EventDetails,
  EventMetaInfo,
  RaEventDetails,
  EventArtist,
} from "../types";
import { redisClient } from "../server";
import { logError, logInfo, logWarning } from "./logger";

const generateRandomNumber = (max: number) => Math.floor(Math.random() * max);

const puppetRequest = async (
  page: Page,
  url: string,
  cssSelector: string,
  cb: (args: Element[]) => string[] | Record<string, string>[]
) => {
  logInfo(`Puppeteer scraping: ${url}`);
  logInfo(`Using selector: ${cssSelector}`);

  await page.goto(url);

  const elements = await page.$$eval(cssSelector, cb);

  return elements;
};

// This function fetches event links from RA and throws and error if it is empty
const getEventLinks = async (searchPageURL: string, page: Page) => {
  const cachedEvents = ((await redisClient.get(
    searchPageURL
  )) as unknown) as any;

  if (cachedEvents) {
    return JSON.parse(cachedEvents);
  }

  const events = await puppetRequest(
    page,
    searchPageURL,
    'h3 > a[href^="/events"]',
    (elements) => elements.map((e) => e.getAttribute("href"))
  );

  logInfo("Number of events found:");
  logInfo(events.length);

  if (events.length == 0) {
    const message = "Event list is empty";
    console.log(message);
    throw message;
  }

  await redisClient.set(searchPageURL, JSON.stringify(events));
  return events;
};

const convertRSHreftoURL = async (href) => {
  // Converts an RS href into a URL
  const baseRaUrl = "https://ra.co";
  const eventUrl = `${baseRaUrl}${href}`;
  return eventUrl;
};

const getRandomEvent = async (eventLinks: string[]) => {
  const randomNumber = generateRandomNumber(eventLinks.length);
  const eventUrl = await convertRSHreftoURL(eventLinks[randomNumber]);
  return eventUrl;
};

const getSoundCloudLinkFromArtist = async (page: Page, artistUrl: string) => {
  // Reads soundcloud link from artist's RA page
  const soundCloudLinks = await puppetRequest(
    page,
    artistUrl,
    'a[href^="https://www.soundcloud.com"]',
    (elements) => elements.map((elem) => elem.getAttribute("href"))
  );
  return soundCloudLinks[0];
};

const getRandomEventArtistScLink = async (
  page: Page,
  eventArtists: EventArtist[]
): Promise<string> => {
  logInfo("GETTING RANDOM SOUNDCLOUD LINK");
  const eventArtistLinks = eventArtists.map((artist) => artist.profileLink);
  const randomNumber = generateRandomNumber(eventArtistLinks.length);
  const randomArtist = eventArtistLinks[randomNumber];
  const baseRaUrl = "https://ra.co";
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
        (artist) => artist.profileLink !== randomArtist
      );
      return getRandomEventArtistScLink(page, reducedEventArtists);
    }

    return artistSoundcloudLink;
  } catch (error) {
    logError("fetchRandomEventArtistScLink failed");
    console.log(error);
    return getRandomEventArtistScLink(page, eventArtists);
  }
};

const getRaEventDetails = async (
  page: Page,
  url: string
): Promise<EventDetails> => {
  // This function searches for artist links on an event page
  const artists = (await puppetRequest(
    page,
    url,
    'a > span[href^="/dj"]',
    (elements) =>
      elements.map((elem) => ({
        name: elem.textContent,
        profileLink: elem.getAttribute("href"),
      }))
  )) as EventArtist[];

  const title = await page.title();

  const metaInfoArray = await page.$$eval(
    "[data-tracking-id=event-detail-bar] span",
    (elements: Element[]) => {
      return elements.map((element) => element.textContent);
    }
  );

  let metaInfo: EventMetaInfo = {
    venue: "",
    address: "",
    date: "",
    openingHours: "",
  };

  if (metaInfoArray.length > 0) {
    metaInfo = {
      venue: metaInfoArray[1],
      address: metaInfoArray[2],
      date: metaInfoArray[4],
      openingHours: `${metaInfoArray[5]} - ${metaInfoArray[7]}`,
    };
  }

  if (artists.length == 0) {
    const message = "No artists found in event page: " + url;
    logWarning(message);
    //throw message
  }

  return { title, artists, ...metaInfo };
};

export const getRandomRaEventArtists = async (
  location: string,
  date: string,
  page: Page
): Promise<RaEventDetails> => {
  try {
    if (!location) location = "berlin";

    const raUrl = `https://ra.co/events/de/${location}?week=${date}`;
    const eventLinks = await getEventLinks(raUrl, page);

    const randomEventPage = await getRandomEvent(eventLinks);

    let eventDetails = await getRaEventDetails(page, randomEventPage);

    while (isEmpty(eventDetails.artists)) {
      console.log("artistLinks were empty, trying again...");
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
      ...eventDetails,
    };
  } catch (error) {
    logError("There was an unknown general error. Fetching a new event.");
    logError(JSON.stringify(error));
    //getRandomRAEventArtistTrack(location)
  }
};

/**
 * Soundcloud scrape
 */
export const getRandomSoundcloudTrack = async (
  scArtistLink: string
): Promise<string> => {
  const scPageString = await axios.get(`${scArtistLink}/tracks/`);
  const scUserID = scPageString.data.match(/(?<=soundcloud:users:)\d+/g);
  const d = await axios.get(
    `https://api-v2.soundcloud.com/users/${scUserID[0]}/tracks?representation=&client_id=fSSdm5yTnDka1g0Fz1CO5Yx6z0NbeHAj&limit=20&offset=0&linked_partitioning=1&app_version=1628858614&app_locale=en`
  );
  const tracks = d.data.collection.map((entry) => entry.permalink_url);
  return tracks[generateRandomNumber(tracks.length)];
};

export const generateSoundcloudEmbed = async (scTrackUrl: string) => {
  const soundcloudEmbedServiceUrl = "https://soundcloud.com/oembed";
  const soundcloudEmbedResponse = await axios.get(soundcloudEmbedServiceUrl, {
    params: {
      url: scTrackUrl,
      format: "json",
      auto_play: false,
      show_teaser: false,
    },
  });

  return soundcloudEmbedResponse.data;
};
