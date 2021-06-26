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

const hardcodedUrl = 'https://ra.co/events/de/berlin?week=2021-06-17'

const generateRandomNumber = max => Math.floor(Math.random() * max)

export const residentAdvisorScraper = async (location?: string) => {
  try {
    if (!location) location = 'berlin'
    // const page = await axios.get(hardcodedUrl)
    // console.log(page.data)
    const browser = await puppeteer.launch();

    // const baseRaUrl = 'https://ra.co'

    const page = await browser.newPage();

    await page.goto(hardcodedUrl);
    await page.screenshot({ path: 'screenshots.png'})

    // const eventLinks = await page.$$eval('h3 > a[href^="/events"]', anchorTags => 
    //   anchorTags.map(a => a.getAttribute('href'))
    // )
    // console.log(eventLinks)

    // const randomNumber = generateRandomNumber(eventLinks.length)

    // await page.goto(`${baseRaUrl}${eventLinks[randomNumber]}`)
    
    // const artistLinks = await page.$$eval('a > span[href^="/dj"', elements => elements.map(element => element.getAttribute('href')))
    // console.log(artistLinks)
    // await page.goto(baseRaUrl + artistLinks[generateRandomNumber(artistLinks.length)])

    // const soundcloudLink = await page.$eval('a[href^="https://www.soundcloud.com"', element => element.getAttribute('href'))
    // await page.goto(soundcloudLink + '/tracks')

    // const artistTracks = await page.$$eval('.soundList .soundTitle__title', elements => elements.map(element => element.getAttribute('href')))
    // console.log(artistTracks)
    
    // const soundcloudBaseUrl = 'https://soundcloud.com'
    // // const fullTrackUrl = soundcloudLink + artistTracks[generateRandomNumber(artistTracks.length)]
    // // console.log(fullTrackUrl)
    
    // const soundcloudEmbedServiceUrl = 'https://soundcloud.com/oembed'
    // const response = await axios.get(soundcloudEmbedServiceUrl, {
    //   params: {
    //     url: soundcloudBaseUrl + artistTracks[generateRandomNumber(artistTracks.length)],
    //     format: 'json'
    //   }
    // })
    // console.log(response.data)
  } catch (error) {
    console.log(error)
  }
  
}

const fetchRandomEvent = async (eventLinks: string[]) => {
  const randomNumber = generateRandomNumber(eventLinks.length)
  const baseRaUrl = 'https://ra.co'
  try {
    const response = await fetch((`${baseRaUrl}${eventLinks[randomNumber]}`))
    const body = await response.text()
    const eventPage = parse(body)

    return eventPage
  } catch (error) {
    return fetchRandomEvent(eventLinks)
  }
}

const fetchRandomEventArtist = async (eventArtistLinks: string[]) => {
  console.log('GETTING RANDOM SOUNDCLOUD LINK')
  const randomNumber = generateRandomNumber(eventArtistLinks.length)
  const baseRaUrl = 'https://ra.co'
  try {
    const response = await fetch((`${baseRaUrl}${eventArtistLinks[randomNumber]}`))
    const body = await response.text()
    const artistPage = parse(body)
    const artistSoundcloudLink = artistPage.querySelector('a[href^="https://www.soundcloud.com"]')

    if (isEmpty(artistSoundcloudLink))  return fetchRandomEventArtist(eventArtistLinks)

    return artistSoundcloudLink.getAttribute('href')
  } catch (error) {
    return fetchRandomEventArtist(eventArtistLinks)
  }
}

export const residentAdvisorScraperFetch = async (location?: string) => {
  try {
    if (!location) location = 'berlin'
    const response = await fetch(hardcodedUrl)
    const body = await response.text()
    const root = parse(body)
    const eventLinks = root.querySelectorAll('h3 > a[href^="/events"]').map(a => a.getAttribute('href'))
    const randomEventPage = await fetchRandomEvent(eventLinks)

    const artistLinks = randomEventPage.querySelectorAll('a > span[href^="/dj"]').map(element => element.getAttribute('href'))
    const randomEventArtistSoundcloudLink = await fetchRandomEventArtist(artistLinks)
    console.log(randomEventArtistSoundcloudLink)

    /**
     * Soundcloud scrape
     */

    console.log('OPENING PUPETTEER')
     const browser = await puppeteer.launch();
     const page = await browser.newPage();
 
     await page.goto(randomEventArtistSoundcloudLink + '/tracks');
    //  await page.waitForTimeout(500)
     const artistTracks = await page.$$eval(
       '.soundList .soundTitle__title',
        elements => elements.map(element => element.getAttribute('href')
      ))
      console.log(artistTracks)
    /**
     * Generating embed code
     */
    const soundcloudBaseUrl = 'https://soundcloud.com'
    const soundcloudEmbedServiceUrl = 'https://soundcloud.com/oembed'
    const soundcloudEmbedResponse = await axios.get(soundcloudEmbedServiceUrl, {
      params: {
        url: soundcloudBaseUrl + artistTracks[generateRandomNumber(artistTracks.length)],
        format: 'json'
      }
    })

    console.log(soundcloudEmbedResponse.data)

  } catch (error) {
    console.log(error)
  }
  
}

residentAdvisorScraperFetch()