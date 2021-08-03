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

import puppeteer from 'puppeteer-extra'
import fetch from 'node-fetch'
import { parse } from 'node-html-parser';
import axios from 'axios';
import { isEmpty } from 'ramda';
import { Console } from 'node:console';
import UserAgent from 'user-agents';




const generateRandomNumber = max => Math.floor(Math.random() * max)

const hardcodedUrl = 'https://ra.co/events/de/berlin?week=2021-06-17'

const puppetRequest = async (browser, url, cssSelector) => {
  const page = await browser.newPage()
  const user = new UserAgent().toString()
  await page.setUserAgent(user)
  await page.goto(url)
  const html = await page.content()
  const page_text = await parse(html)
  const elements = await page_text.querySelectorAll(cssSelector)
  return elements
}

const fetchEventLinks = async(searchPageURL,browser_default) => {
  // selector uses CCS selectors: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors
  // .map is a function to apply a function to every item in an array and then return the array
  //const events = root.querySelectorAll('h3 > a[href^="/events"]').map(a => a.getAttribute('href'))
  

  // https://stackoverflow.com/questions/55678095/bypassing-captchas-with-headless-chrome-using-puppeteer

  const chromeOptions = {
    headless:false,
    defaultViewport: null};
    
  const browser = await puppeteer.launch();
  // const searchPage = await browser.newPage();
  // const user = new UserAgent().toString()
  // console.log(user)

  // await searchPage.setUserAgent(user)
  // await searchPage.goto(searchPageURL);

  // console.log(searchPageURL)

  // await searchPage.screenshot({path: 'screenshot_RA_events.png'})
  // const html = await searchPage.content()
  // const page_text = await parse(html)


  // const event_elements = await page_text.querySelectorAll('h3 > a[href^="/events"]')
  
  const event_elements = await puppetRequest(browser,searchPageURL,'h3 > a[href^="/events"]')

  const event_elements_array = await Array.from(event_elements)
  
  const events = await event_elements_array.map(a => a.getAttribute('href'))
  console.log(events)

  console.log('Number of events found:')
  console.log(typeof events)
  console.log(events.length)
  //await searchPage.close()

  if(events.length == 0) {
    const message = "Event list is empty"
    console.log(message)
    throw message    
  }
  
  return events
}


const fetchRandomEvent = async (eventLinks: string[]) => {
  const randomNumber = generateRandomNumber(eventLinks.length)
  //console.log('List item: '+randomNumber)
  
  const baseRaUrl = 'https://ra.co'
  
  try {
    const eventUrl = `${baseRaUrl}${eventLinks[randomNumber]}`
	//console.log(`PROCESSING EVENT: ${eventUrl}`)
    const response = await fetch((eventUrl))
    const body = await response.text()
    const eventPage = parse(body)

    return eventPage
  } catch (error) {
    return fetchRandomEvent(eventLinks)
  }
}

const fetchRandomEventArtist = async (eventArtistLinks: string[]) => {
  console.log('GETTING RANDOM SOUNDCLOUD LINK')
  console.log('event artist links:')
  console.log(eventArtistLinks)
  const randomNumber = generateRandomNumber(eventArtistLinks.length)
  const randomArtist = eventArtistLinks[randomNumber]
  const baseRaUrl = 'https://ra.co'

  if (isEmpty(eventArtistLinks)) {
    return null
  }

  try {
    const response = await fetch((`${baseRaUrl}${randomArtist}`))
    const body = await response.text()
    const artistPage = parse(body)
    const artistSoundcloudLink = artistPage.querySelector('a[href^="https://www.soundcloud.com"]')

    if (!artistSoundcloudLink)  {
      const reducedEventArtistLinks = eventArtistLinks.filter(artist => artist !== randomArtist)
      return fetchRandomEventArtist(reducedEventArtistLinks)
    }

    return artistSoundcloudLink.getAttribute('href')
  } catch (error) {
    console.log('ERROR IN: fetchRandomEventArtist')
    console.log(error)
    return fetchRandomEventArtist(eventArtistLinks)
  }
}


export const getRandomRAEventArtistTrack = async (location?: string) => {
  console.log('OPENING PUPETTEER')
  /**
   * TODO: maybe do not block the function , move this to other async thread
   */
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    if (!location) location = 'berlin'

    const eventLinks = await fetchEventLinks(hardcodedUrl,browser)
	
	console.log('Event links list: ')
	console.log(eventLinks)
	
    const randomEventPage = await fetchRandomEvent(eventLinks)

    let artistLinks = randomEventPage.querySelectorAll('a > span[href^="/dj"]').map(element => element.getAttribute('href'))

    while (isEmpty(artistLinks)) {
      console.log('artistLinks were empty, trying again...')
      const randomEventPage = await fetchRandomEvent(eventLinks)
      await setTimeout(() => { console.log("Waiting"); }, 2000);
      artistLinks = randomEventPage.querySelectorAll('a > span[href^="/dj"]').map(element => element.getAttribute('href'))
    }

    const randomEventArtistSoundcloudLink = await fetchRandomEventArtist(artistLinks)
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