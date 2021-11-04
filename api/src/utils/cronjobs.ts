#! /app/.heroku/node/bin/node
import { logError, logInfo, logWarning, logSuccess} from "./logger"
import {
    getRandomRaEventArtists, 
    getRandomSoundcloudTrack,
    generateSoundcloudEmbed
} from "./raScraper"
import { format } from 'date-fns'

import { Crawler } from "../utils/Crawler";

const getCurrentDate = () => format(new Date(), 'yyyy-MM-dd')

const pushButton = async ()=>{
    // This function simulates a single button push from the front end
    const date = getCurrentDate()
    const location = 'berlin'
    const autoPlay = true

    const crawler = new Crawler();
    await crawler.init();
    const page =  await crawler.getPage();

    const randomRaEventDetails = await getRandomRaEventArtists(
        location as string,
        date as string,
        page
      );

    const randomSoundcloudTrack = await getRandomSoundcloudTrack(
        randomRaEventDetails.randomEventScLink
      );
      logSuccess(`SOUNDCLOUD TRACK: ${randomSoundcloudTrack}`);

    const soundcloudOembed = await generateSoundcloudEmbed(
        randomSoundcloudTrack,
        // Should extendx Red.query type definitions
        (autoPlay as unknown) as boolean
    );
}

const runJobs = async()=>{
    await pushButton()
    process.exit()

}

runJobs()

