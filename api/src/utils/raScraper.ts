import dotenv from 'dotenv'
import axios from 'axios';
import { isEmpty } from 'ramda';
import puppeteer, { Page }  from 'puppeteer';
import { EventInfo, EventMetaInfo, RaEventInfo } from '../types';

dotenv.config()

const generateRandomNumber = (max: number) => Math.floor(Math.random() * max)

const puppetRequest = async (
  page: puppeteer.Page, 
  url: string, 
  cssSelector: string,
  cb: (args: Element[]) => string[]
) => {
  console.log('Requestion from: ', url)
  console.log('Using selectors: ', cssSelector)
  await page.goto(url)

  const elements = await page.$$eval(cssSelector, cb)

  return elements
}

// This function fetches event links from RA and throws and error if it is empty
const fetchEventLinks = async(searchPageURL: string, page: puppeteer.Page) => {
  const events = await puppetRequest(
    page, 
    searchPageURL, 
    'h3 > a[href^="/events"]',
    elements => elements.map(e => e.getAttribute('href'))
  )

  console.log('Number of events found:')
  console.log(events.length)
  
  if(events.length == 0) {
    const message = "Event list is empty"
    console.log(message)
    throw message    
  }

  return events
}

const convertRSHreftoURL = async(href) => {
  // Converts an RS href into a URL
  const baseRaUrl = 'https://ra.co'
  const eventUrl = `${baseRaUrl}${href}`
	return eventUrl
}

const fetchRandomEvent = async (eventLinks: string[]) => {
  const randomNumber = generateRandomNumber(eventLinks.length)
	const eventUrl = await convertRSHreftoURL(eventLinks[randomNumber])
  return eventUrl
}

const fetchSoundCloudLinkFromArtist = async (page: puppeteer.Page, artistUrl: string) => {
  // Reads soundcloud link from artist's RA page
  const soundCloudLinks = await puppetRequest(
    page, 
    artistUrl, 
    'a[href^="https://www.soundcloud.com"]',
    elements => elements.map(elem => elem.getAttribute('href'))
  )
  return soundCloudLinks[0]
}

const fetchRandomEventArtistScLink = async (page, eventArtistLinks: string[]) => {
  console.log('GETTING RANDOM SOUNDCLOUD LINK')
  const randomNumber = generateRandomNumber(eventArtistLinks.length)
  const randomArtist = eventArtistLinks[randomNumber]
  const baseRaUrl = 'https://ra.co'
  const randomArtistURL = baseRaUrl + randomArtist

  if (isEmpty(eventArtistLinks)) {
    return null
  }

  try {
    const artistSoundcloudLink = await fetchSoundCloudLinkFromArtist(page, randomArtistURL)

    if (!artistSoundcloudLink)  {
      const reducedEventArtistLinks = eventArtistLinks.filter(artist => artist !== randomArtist)
      return fetchRandomEventArtistScLink(page, reducedEventArtistLinks)
    }

    return artistSoundcloudLink
  } catch (error) {
    console.log('ERROR IN: fetchRandomEventArtistScLink')
    console.log(error)
    return fetchRandomEventArtistScLink(page, eventArtistLinks)
  }
}

const fetchArtistLinksFromEvent = async (
  page: puppeteer.Page, 
  url: string
): Promise<EventInfo> => {
  // This function searches for artist links on an event page
  const artists = await puppetRequest(
    page, 
    url, 
    'a > span[href^="/dj"]',
    elements => elements.map(elem => elem.getAttribute('href'))
  )

  const title = await page.title()
  
  const metaInfoArray = await page.$$eval('[data-tracking-id=event-detail-bar] span', (elements: Element[]) => {
    return elements.map(element => element.textContent)
  })
  
  let metaInfo: EventMetaInfo = {
    venue: '',
    address: '',
    date: '',
    openingHours: '',
  }

  if (metaInfoArray.length > 0) {
    metaInfo = {
      venue: metaInfoArray[1],
      address: metaInfoArray[2],
      date: metaInfoArray[4],
      openingHours: `${metaInfoArray[5]} - ${metaInfoArray[7]}`
    }
  }
  
  if (artists.length == 0){
    const message = "No artists found in event page: " + url
    console.log(message)
    //throw message 
  }
  
  return { title, artists, ...metaInfo }
}

export const getRandomRaEventArtists = async (
  location?: string, 
  date?: string, 
  page?: Page
): Promise<RaEventInfo> => {
  try {
    if (!location) location = 'berlin'

    const raUrl = `https://ra.co/events/de/${location}?week=${date}`
    const eventLinks = await fetchEventLinks(raUrl, page)
	
    const randomEventPage = await fetchRandomEvent(eventLinks)

    let eventInfo = await fetchArtistLinksFromEvent(page, randomEventPage)

    while (isEmpty(eventInfo.artists)) {
      console.log('artistLinks were empty, trying again...')
      const randomEventPage = await fetchRandomEvent(eventLinks)
      eventInfo = await fetchArtistLinksFromEvent(page, randomEventPage)
    }

    const randomEventArtistSoundcloudLink = await fetchRandomEventArtistScLink(page, eventInfo.artists)
    console.log('ARTIST SOUNDCLOUD LINK:')
    console.log(randomEventArtistSoundcloudLink)

    if (!randomEventArtistSoundcloudLink) {
      return getRandomRaEventArtists(location)
    }

    return {
      eventLink: randomEventPage,
      randomEventScLink: randomEventArtistSoundcloudLink,
      ...eventInfo
    }

  } catch (error) {
    console.error('There was an unknown general error. Fetching a new event.')
    console.log(error)
    //getRandomRAEventArtistTrack(location)
  }  
}

/**
 * Soundcloud scrape
 */
export const getRandomSoundcloudTrack = async (scArtistLink: string) => {
  const scClientId = 'fSSdm5yTnDka1g0Fz1CO5Yx6z0NbeHAj'
  const scPageString = await axios.get(`${scArtistLink}/tracks/`)
  const scUserID = scPageString.data.match(/(?<=soundcloud:users:)\d+/g)
  const d = await axios.get(`https://api-v2.soundcloud.com/users/${scUserID[0]}/tracks?representation=&client_id=fSSdm5yTnDka1g0Fz1CO5Yx6z0NbeHAj&limit=20&offset=0&linked_partitioning=1&app_version=1628858614&app_locale=en`)
  const tracks = d.data.collection.map(entry => entry.permalink_url)
  return tracks[generateRandomNumber(tracks.length)]
}

export const generateSoundcloudEmbed = async (scTrackUrl: string) => {
  const soundcloudEmbedServiceUrl = 'https://soundcloud.com/oembed'
  const soundcloudEmbedResponse = await axios.get(soundcloudEmbedServiceUrl, {
    params: {
      url: scTrackUrl,
      format: 'json',
      auto_play: true,
      show_teaser: false,
    }
  })

  return soundcloudEmbedResponse.data
}

// if (require.main === module) {
//   console.log('called directly');
// } else {
//   console.log('required as a module');
// }