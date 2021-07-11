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

import puppeteer from 'puppeteer-extra'
import fetch from 'node-fetch'
import { parse } from 'node-html-parser';
import axios from 'axios';
import { isEmpty } from 'ramda';
import { Console } from 'node:console';


const generateRandomNumber = max => Math.floor(Math.random() * max)

const fetchRandomEvent = async (eventLinks: string[]) => {
  const randomNumber = generateRandomNumber(eventLinks.length)
  const baseRaUrl = 'https://ra.co'
  try {
    const eventUrl = `${baseRaUrl}${eventLinks[randomNumber]}`
    console.log(`PROCESSING EVENT: ${eventUrl}`)
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

const hardcodedUrl = 'https://ra.co/events/de/berlin?week=2021-06-17'


export const getRandomRAEventArtistTrack = async (location?: string) => {
  console.log('OPENING PUPETTEER')
  /**
   * TODO: maybe do not block the function , move this to other async thread
   */
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    if (!location) location = 'berlin'
    const response = await fetch(hardcodedUrl)
    const body = await response.text()
    const root = parse(body)
    const eventLinks = root.querySelectorAll('h3 > a[href^="/events"]').map(a => a.getAttribute('href'))
    const randomEventPage = await fetchRandomEvent(eventLinks)

    let artistLinks = randomEventPage.querySelectorAll('a > span[href^="/dj"]').map(element => element.getAttribute('href'))

    while (isEmpty(artistLinks)) {
      console.log('artistLinks were empty, trying again...')
      const randomEventPage = await fetchRandomEvent(eventLinks)
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
    getRandomRAEventArtistTrack(location)
  }
  
}