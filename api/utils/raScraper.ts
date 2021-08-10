// const browser = await puppeteer.launch({ 
//     headless: false,
//     defaultViewport: null,
// }); ;
// const page = await browser.newPage();
// const runScript = async () => {
//   console.log('Running script again..')
//   try {
//     await page.goto('https://soundcloud.com/paulatape/paula-tape-streaming-from-isolation');
//     const shareBtn = '.sc-button-share.sc-button.sc-button-medium.sc-button-responsive'
//     const cookiesAccept = '#onetrust-accept-btn-handler'
//     await page.waitForTimeout(1000)
//     await page.click(cookiesAccept)
//     await page.waitForTimeout(1000)
//     await page.click(shareBtn)
//     const embedTabSel = '.tabs__tab.g-tabs-link'
//     await page.click(embedTabSel)
//     const iframeInput = 'widgetCustomization__textInput.widgetCustomization__widgetCode'
//     const embedCode = await page.$$eval(iframeInput, e => console.log(e))
//   }
// catch (error) {
//         setTimeout(() => runScript(), 1000 * 60)
//       console.error(error)
//   }
// }
// import puppeteer from 'puppeteer'

// imports for using node: 'const library = require('cool-library')
// const puppeteer = required('puppeteer-extra')
// import fetch from 'node-fetch'
// import { parse } from 'node-html-parser';
// import axios from 'axios';
// import { isEmpty } from 'ramda';
// import { Console } from 'node:console';



//imports original

//import puppeteer from 'puppeteer-extra'
import chromium from 'chrome-aws-lambda'

import { parse } from 'node-html-parser';
import axios from 'axios';
import { isEmpty } from 'ramda';
import UserAgent from 'user-agents';


const generateRandomNumber = max => Math.floor(Math.random() * max)

const hardcodedUrl = 'https://ra.co/events/de/berlin?week=2021-08-03'

const puppetRequest = async (browser, url, cssSelector) => {
  // This function takes a puppetteer browser and uses it to make a request, 
  // using techniques to make it harder for the website to block the scrape
  // https://stackoverflow.com/questions/55678095/bypassing-captchas-with-headless-chrome-using-puppeteer
  console.log('Requestion from: '+url)
  console.log('Using selectors: '+cssSelector)

  const page = await browser.newPage()
  const user = new UserAgent().toString()
  await page.setUserAgent(user)
  await page.goto(url)
  const html = await page.content()
  const page_text = await parse(html)
  const elements = await page_text.querySelectorAll(cssSelector)
  await page.close()
  return elements
}

const fetchEventLinks = async(searchPageURL,browser) => {
  // This function fetches event links from RA and throws and error if it is empty

  const event_elements = await puppetRequest(browser,searchPageURL,'h3 > a[href^="/events"]')
  const event_elements_array = await Array.from(event_elements)
  const events = await event_elements_array.map(a => a.getAttribute('href'))
  console.log(events)

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
  //const baseRaUrl = 'https://ra.co'
  //const eventUrl = `${baseRaUrl}${eventLinks[randomNumber]}`
	const eventUrl = await convertRSHreftoURL(eventLinks[randomNumber])
  return eventUrl
}

const fetchSoundCloudLinkFromArtist = async (browser, artistUrl) => {
  // Reads soundcloud link from artist's RA page
  const soundCloudLink = await puppetRequest(browser,artistUrl,'a[href^="https://www.soundcloud.com"]')
  return soundCloudLink[0]
}

const fetchRandomEventArtist = async (browser, eventArtistLinks: string[]) => {
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
    // const response = await fetch((`${baseRaUrl}${randomArtist}`))
    // const body = await response.text()
    // const artistPage = parse(body)
    // const artistSoundcloudLink = artistPage.querySelector('a[href^="https://www.soundcloud.com"]')

    const artistSoundcloudLink = await fetchSoundCloudLinkFromArtist(browser,randomArtistURL)

    if (!artistSoundcloudLink)  {
      const reducedEventArtistLinks = eventArtistLinks.filter(artist => artist !== randomArtist)
      return fetchRandomEventArtist(browser, reducedEventArtistLinks)
    }

    return artistSoundcloudLink.getAttribute('href')
  } catch (error) {
    console.log('ERROR IN: fetchRandomEventArtist')
    console.log(error)
    return fetchRandomEventArtist(browser, eventArtistLinks)
  }
}

const fetchArtistLinksFromEvent = async (browser,url) => {
  // This function searches for artist links on an event page

  const artistsLinks = await puppetRequest(browser,url,'a > span[href^="/dj"]')
  const artist_elements_array = await Array.from(artistsLinks)
  const artists = await artist_elements_array.map(a => a.getAttribute('href'))
  
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

  const browser = await chromium.puppeteer.launch({
    args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: true,
    ignoreHTTPSErrors: true,
  })



  const page = await browser.newPage();

  try {
    if (!location) location = 'berlin'

    const eventLinks = await fetchEventLinks(hardcodedUrl,browser)
	
	console.log('Event links list: ')
	console.log(eventLinks)
	
    const randomEventPage = await fetchRandomEvent(eventLinks)

    let artistLinks = await fetchArtistLinksFromEvent(browser,randomEventPage)
    
    while (isEmpty(artistLinks)) {
      console.log('artistLinks were empty, trying again...')
      const randomEventPage = await fetchRandomEvent(eventLinks)
      await setTimeout(() => { console.log("Waiting"); }, 2000);
      //artistLinks = randomEventPage.querySelectorAll('a > span[href^="/dj"]').map(element => element.getAttribute('href'))
      artistLinks = await fetchArtistLinksFromEvent(browser,randomEventPage)
    }

    const randomEventArtistSoundcloudLink = await fetchRandomEventArtist(browser, artistLinks)
    console.log('ARTIST SOUNDCLOUD LINK:')
    console.log(randomEventArtistSoundcloudLink)

    if (!randomEventArtistSoundcloudLink) {
      return getRandomRAEventArtistTrack(location)
    }

    /**
     * Soundcloud scrape
     */
 
     await page.goto(randomEventArtistSoundcloudLink + '/tracks');
     await page.waitForSelector('.soundList .soundTitle__title');
     const artistTracks = await page.$$eval(
       '.soundList .soundTitle__title',
        elements => elements.map(element => element.getAttribute('href')
      ))
      browser.close()
      console.log(artistTracks)
    /**
     * Generating embed code
     */
    const soundcloudBaseUrl = 'https://soundcloud.com'
    const soundcloudEmbedServiceUrl = 'https://soundcloud.com/oembed'
    const soundcloudEmbedResponse = await axios.get(soundcloudEmbedServiceUrl, {
      params: {
        url: soundcloudBaseUrl + artistTracks[generateRandomNumber(artistTracks.length)],
        format: 'json',
        auto_play: true,
        show_teaser: false,
      }
    })

    console.log(soundcloudEmbedResponse.data)
    return soundcloudEmbedResponse.data

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