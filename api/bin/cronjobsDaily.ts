#! /app/.heroku/node/bin/node
import { logError, logInfo, logWarning, logSuccess} from "../src/utils/logger"
import {
    getRandomRaEventArtists, 
    getRandomSoundcloudTrack,
    generateSoundcloudEmbed
} from "../src/utils/raScraper"
import { format } from 'date-fns'

import { Crawler } from "../src/utils/Crawler";

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


}

const runJobs = async()=>{
    await pushButton()
    process.exit()

}

runJobs()

