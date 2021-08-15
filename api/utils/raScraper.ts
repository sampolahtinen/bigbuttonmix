import dotenv from 'dotenv'
import { parse } from 'node-html-parser';
import axios from 'axios';
import fetch from 'node-fetch'
import { isEmpty } from 'ramda';
import UserAgent from 'user-agents';
import chrome from 'chrome-aws-lambda'
import puppeteer, { Browser, Puppeteer, registerCustomQueryHandler } from 'puppeteer-core';

dotenv.config()

const generateRandomNumber = max => Math.floor(Math.random() * max)

const hardcodedUrl = 'https://ra.co/events/de/berlin?week=2021-08-03'

const blockedDomains = [
  // "securepubads.g.doubleclick.net",
  // "google-analytics.com",
  // "p1.parsely.com",
  // "live.ravelin.click",
  // "stats.g.doubleclick.net",
  "a-v2.sndcdn.com"
]

const minimalArgs = [
  '--autoplay-policy=user-gesture-required',
  '--disable-background-networking',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-breakpad',
  '--disable-client-side-phishing-detection',
  '--disable-component-update',
  '--disable-default-apps',
  '--disable-dev-shm-usage',
  '--disable-domain-reliability',
  '--disable-extensions',
  '--disable-features=AudioServiceOutOfProcess',
  '--disable-hang-monitor',
  '--disable-ipc-flooding-protection',
  '--disable-notifications',
  '--disable-offer-store-unmasked-wallet-cards',
  '--disable-popup-blocking',
  '--disable-print-preview',
  '--disable-prompt-on-repost',
  '--disable-renderer-backgrounding',
  '--disable-setuid-sandbox',
  '--disable-speech-api',
  '--disable-sync',
  '--hide-scrollbars',
  '--ignore-gpu-blacklist',
  '--metrics-recording-only',
  '--mute-audio',
  '--no-default-browser-check',
  '--no-first-run',
  '--no-pings',
  '--no-sandbox',
  '--no-zygote',
  '--password-store=basic',
  '--use-gl=swiftshader',
  '--use-mock-keychain',
];

const fetchPage = async (url: string, cssSelector: string) => {
  // This function takes a puppetteer browser and uses it to make a request, 
  // using techniques to make it harder for the website to block the scrape
  // https://stackoverflow.com/questions/55678095/bypassing-captchas-with-headless-chrome-using-puppeteer
  console.time('fetchPage')
  
  console.log('Requestion from: ', url)
  console.log('Using selectors: ', cssSelector)
  const userAgent = new UserAgent().toString()
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36'
    }
  })
  // const body = await response.text()
  const pageContent = parse(response.data)
  console.log(pageContent)
  const elements = pageContent.querySelectorAll(cssSelector)
  console.timeEnd('fetchPage')
  return elements
}

const puppetRequest = async (page: puppeteer.Page, url: string, cssSelector: string) => {
  // This function takes a puppetteer browser and uses it to make a request, 
  // using techniques to make it harder for the website to block the scrape
  // https://stackoverflow.com/questions/55678095/bypassing-captchas-with-headless-chrome-using-puppeteer
  console.time('puppetRequest')
  
  console.log('Requestion from: ', url)
  console.log('Using selectors: ', cssSelector)

  await page.goto(url)
  const html = await page.content()
  const pageText = parse(html)
  const elements = pageText.querySelectorAll(cssSelector)

  console.timeEnd('puppetRequest')
  return elements
}

const fetchEventLinks = async(searchPageURL, page) => {
  // This function fetches event links from RA and throws and error if it is empty
  console.time('raEvents')
  const eventElements = await puppetRequest(page, searchPageURL,'h3 > a[href^="/events"]')
  // const fetchResults = await fetchPage(searchPageURL,'h3 > a[href^="/events"]')
  // console.log(fetchResults)
  const events = [...eventElements].map(a => a.getAttribute('href'))

  console.log('Number of events found:')
  console.log(events.length)
  
  if(events.length == 0) {
    const message = "Event list is empty"
    console.log(message)
    throw message    
  }
  console.timeEnd('raEvents')
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
  //const baseRaUrl = 'https://ra.co'
  //const eventUrl = `${baseRaUrl}${eventLinks[randomNumber]}`
	const eventUrl = await convertRSHreftoURL(eventLinks[randomNumber])
  return eventUrl
}

const fetchSoundCloudLinkFromArtist = async (page, artistUrl) => {
  // Reads soundcloud link from artist's RA page
  const soundCloudLink = await puppetRequest(page, artistUrl, 'a[href^="https://www.soundcloud.com"]')
  return soundCloudLink[0]
}

const fetchRandomEventArtist = async (page, eventArtistLinks: string[]) => {
  console.log('GETTING RANDOM SOUNDCLOUD LINK')
  console.log('event artist links:')
  console.log(eventArtistLinks)
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
      return fetchRandomEventArtist(page, reducedEventArtistLinks)
    }

    return artistSoundcloudLink.getAttribute('href')
  } catch (error) {
    console.log('ERROR IN: fetchRandomEventArtist')
    console.log(error)
    return fetchRandomEventArtist(page, eventArtistLinks)
  }
}

const fetchArtistLinksFromEvent = async (page, url) => {
  // This function searches for artist links on an event page
  const artistsLinks = await puppetRequest(page, url,'a > span[href^="/dj"]')
  const artists = [...artistsLinks].map(a => a.getAttribute('href'))
  
  if (artists.length == 0){
    const message = "No artists found in event page: " + url
    console.log(message)
    //throw message 
  }
  
  return artists
}

export const getRandomRAEventArtistTrack = async (location?: string) => {
  console.log('OPENING PUPETTEER')
  /**
   * TODO: maybe do not block the function , move this to other async thread
   */
  //const browser = await puppeteer.launch();
  // https://github.com/vercel/vercel/discussions/4903

  console.time('puppeteerLaunch')
  const  browser = process.env.AWS_EXECUTION_ENV 
  ? await puppeteer.launch({
    args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
    defaultViewport: chrome.defaultViewport,
    executablePath: await chrome.executablePath,
    headless: true,
    ignoreHTTPSErrors: true,
  })
  : await puppeteer.launch({
    dumpio: true,
    args: minimalArgs,
    headless: true,
    ignoreHTTPSErrors: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  })

  const page = await browser.newPage();
  await page.setRequestInterception(true);

  page.on('request', (req) => {
    if(
      req.resourceType() === 'image'
      || req.resourceType() === 'stylesheet'
      || req.resourceType() === 'font'
      || blockedDomains.some(domain => req.url().includes(domain))
      || (req.url().includes('https://api-v2.soundcloud.com') && !req.url().includes('/tracks'))
    ){
      req.abort();
    } else {
      req.continue();
    }
})

  const user = new UserAgent().toString()
  await page.setUserAgent(user)

  console.timeEnd('puppeteerLaunch')
  try {
    if (!location) location = 'berlin'

    const eventLinks = await fetchEventLinks(hardcodedUrl, page)

    console.log('Event links list: ')
    console.log(eventLinks)
	
    console.time('raRandomEvent')
    const randomEventPage = await fetchRandomEvent(eventLinks)
    console.timeEnd('raRandomEvent')

    console.time('raEventArtists')
    let artistLinks = await fetchArtistLinksFromEvent(page,randomEventPage)
    console.timeEnd('raEventArtists')

    while (isEmpty(artistLinks)) {
      console.log('artistLinks were empty, trying again...')
      const randomEventPage = await fetchRandomEvent(eventLinks)
      await setTimeout(() => { console.log("Waiting"); }, 2000);
      artistLinks = await fetchArtistLinksFromEvent(page,randomEventPage)
    }

    const randomEventArtistSoundcloudLink = await fetchRandomEventArtist(page, artistLinks)
    console.log('ARTIST SOUNDCLOUD LINK:')
    console.log(randomEventArtistSoundcloudLink)

    if (!randomEventArtistSoundcloudLink) {
      return getRandomRAEventArtistTrack(location)
    }

    /**
     * Soundcloud scrape
     */
    const soundcloudEmbedServiceUrl = 'https://soundcloud.com/oembed'

    await page.goto(randomEventArtistSoundcloudLink + '/tracks');

  //   page.on('response', async (res) => {
  //     const url = res.url()
  //     console.log(url)
  //     if (url.includes('https://api-v2.soundcloud.com/users') && url.includes('/tracks')) {
  //       console.log(res.url())
  //       const data = await res.json()
  //       const tracks = data.collection.map(entry => entry.permalink_url)
  //       console.log(tracks)
  //       // const soundcloudEmbedResponse = await axios.get(soundcloudEmbedServiceUrl, {
  //       //   params: {
  //       //     url: tracks[generateRandomNumber(tracks.length)],
  //       //     format: 'json',
  //       //     auto_play: true,
  //       //     show_teaser: false,
  //       //   }
  //       // })

  //       // Promise.resolve(soundcloudEmbedResponse.data)
  //     }
  // })

    return 'ok'
  } catch (error) {
    console.error('There was an unknown general error. Fetching a new event.')
    console.log(error)
    //getRandomRAEventArtistTrack(location)
  }
  
}

if (require.main === module) {
  console.log('called directly');
} else {
  console.log('required as a module');
}