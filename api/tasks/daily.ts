#! /app/.heroku/node/bin/node
import { logError, logInfo, logWarning, logSuccess} from "../src/utils/logger"
import {
    getRandomRaEventArtists
} from "../src/utils/raScraper"
import { format } from 'date-fns'

import { Crawler } from "../src/utils/Crawler";
import { redisClient } from "../src/server";

logInfo("Running daily tasks")


const getCurrentDate = () => format(new Date(), 'yyyy-MM-dd')

const getRandomEventBerlin = async ()=>{
    // This function simulates a single button push from the front end
    const date = getCurrentDate()
    const location = {country: 'germany', city: 'berlin'}
    const autoPlay = true

    const crawler = new Crawler();
    await crawler.init();
    const page =  await crawler.getPage();

    const randomRaEventDetails = await getRandomRaEventArtists(
        location,
        date,
        page
      );
}

const runDailyJobs = async()=>{
    try {
        await getRandomEventBerlin()
        process.exit()
    } catch (error) {
        logError(JSON.stringify(error))
        process.exit()
    }
}

runDailyJobs()