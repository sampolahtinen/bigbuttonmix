"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSoundcloudEmbed = exports.getRandomSoundcloudTrack = exports.getRandomRaEventArtists = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
const ramda_1 = require("ramda");
dotenv_1.default.config();
const generateRandomNumber = (max) => Math.floor(Math.random() * max);
const puppetRequest = async (page, url, cssSelector, cb) => {
    console.log('Requestion from: ', url);
    console.log('Using selectors: ', cssSelector);
    await page.goto(url);
    const elements = await page.$$eval(cssSelector, cb);
    return elements;
};
// This function fetches event links from RA and throws and error if it is empty
const fetchEventLinks = async (searchPageURL, page) => {
    const events = await puppetRequest(page, searchPageURL, 'h3 > a[href^="/events"]', elements => elements.map(e => e.getAttribute('href')));
    console.log('Number of events found:');
    console.log(events.length);
    if (events.length == 0) {
        const message = "Event list is empty";
        console.log(message);
        throw message;
    }
    return events;
};
const convertRSHreftoURL = async (href) => {
    // Converts an RS href into a URL
    const baseRaUrl = 'https://ra.co';
    const eventUrl = `${baseRaUrl}${href}`;
    return eventUrl;
};
const fetchRandomEvent = async (eventLinks) => {
    const randomNumber = generateRandomNumber(eventLinks.length);
    const eventUrl = await convertRSHreftoURL(eventLinks[randomNumber]);
    return eventUrl;
};
const fetchSoundCloudLinkFromArtist = async (page, artistUrl) => {
    // Reads soundcloud link from artist's RA page
    const soundCloudLinks = await puppetRequest(page, artistUrl, 'a[href^="https://www.soundcloud.com"]', elements => elements.map(elem => elem.getAttribute('href')));
    return soundCloudLinks[0];
};
const fetchRandomEventArtistScLink = async (page, eventArtistLinks) => {
    console.log('GETTING RANDOM SOUNDCLOUD LINK');
    const randomNumber = generateRandomNumber(eventArtistLinks.length);
    const randomArtist = eventArtistLinks[randomNumber];
    const baseRaUrl = 'https://ra.co';
    const randomArtistURL = baseRaUrl + randomArtist;
    if (ramda_1.isEmpty(eventArtistLinks)) {
        return null;
    }
    try {
        const artistSoundcloudLink = await fetchSoundCloudLinkFromArtist(page, randomArtistURL);
        if (!artistSoundcloudLink) {
            const reducedEventArtistLinks = eventArtistLinks.filter(artist => artist !== randomArtist);
            return fetchRandomEventArtistScLink(page, reducedEventArtistLinks);
        }
        return artistSoundcloudLink;
    }
    catch (error) {
        console.log('ERROR IN: fetchRandomEventArtistScLink');
        console.log(error);
        return fetchRandomEventArtistScLink(page, eventArtistLinks);
    }
};
const fetchArtistLinksFromEvent = async (page, url) => {
    // This function searches for artist links on an event page
    const artists = await puppetRequest(page, url, 'a > span[href^="/dj"]', elements => elements.map(elem => elem.getAttribute('href')));
    const title = await page.title();
    const metaInfoArray = await page.$$eval('[data-tracking-id=event-detail-bar] span', (elements) => {
        return elements.map(element => element.textContent);
    });
    let metaInfo = {
        venue: '',
        address: '',
        date: '',
        openingHours: '',
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
        const message = "No artists found in event page: " + url;
        console.log(message);
        //throw message 
    }
    return Object.assign({ title, artists }, metaInfo);
};
const getRandomRaEventArtists = async (location, date, page) => {
    try {
        if (!location)
            location = 'berlin';
        const raUrl = `https://ra.co/events/de/${location}?week=${date}`;
        const eventLinks = await fetchEventLinks(raUrl, page);
        const randomEventPage = await fetchRandomEvent(eventLinks);
        let eventInfo = await fetchArtistLinksFromEvent(page, randomEventPage);
        while (ramda_1.isEmpty(eventInfo.artists)) {
            console.log('artistLinks were empty, trying again...');
            const randomEventPage = await fetchRandomEvent(eventLinks);
            eventInfo = await fetchArtistLinksFromEvent(page, randomEventPage);
        }
        const randomEventArtistSoundcloudLink = await fetchRandomEventArtistScLink(page, eventInfo.artists);
        console.log('ARTIST SOUNDCLOUD LINK:');
        console.log(randomEventArtistSoundcloudLink);
        if (!randomEventArtistSoundcloudLink) {
            return exports.getRandomRaEventArtists(location);
        }
        return Object.assign({ eventLink: randomEventPage, randomEventScLink: randomEventArtistSoundcloudLink }, eventInfo);
    }
    catch (error) {
        console.error('There was an unknown general error. Fetching a new event.');
        console.log(error);
        //getRandomRAEventArtistTrack(location)
    }
};
exports.getRandomRaEventArtists = getRandomRaEventArtists;
/**
 * Soundcloud scrape
 */
const getRandomSoundcloudTrack = async (scArtistLink) => {
    const scClientId = 'fSSdm5yTnDka1g0Fz1CO5Yx6z0NbeHAj';
    const scPageString = await axios_1.default.get(`${scArtistLink}/tracks/`);
    const scUserID = scPageString.data.match(/(?<=soundcloud:users:)\d+/g);
    const d = await axios_1.default.get(`https://api-v2.soundcloud.com/users/${scUserID[0]}/tracks?representation=&client_id=fSSdm5yTnDka1g0Fz1CO5Yx6z0NbeHAj&limit=20&offset=0&linked_partitioning=1&app_version=1628858614&app_locale=en`);
    const tracks = d.data.collection.map(entry => entry.permalink_url);
    return tracks[generateRandomNumber(tracks.length)];
};
exports.getRandomSoundcloudTrack = getRandomSoundcloudTrack;
const generateSoundcloudEmbed = async (scTrackUrl) => {
    const soundcloudEmbedServiceUrl = 'https://soundcloud.com/oembed';
    const soundcloudEmbedResponse = await axios_1.default.get(soundcloudEmbedServiceUrl, {
        params: {
            url: scTrackUrl,
            format: 'json',
            auto_play: true,
            show_teaser: false,
        }
    });
    return soundcloudEmbedResponse.data;
};
exports.generateSoundcloudEmbed = generateSoundcloudEmbed;
// if (require.main === module) {
//   console.log('called directly');
// } else {
//   console.log('required as a module');
// }
//# sourceMappingURL=raScraper.js.map