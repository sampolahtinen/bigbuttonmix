#! /app/.heroku/node/bin/node
import { redisClient } from "../src/server";
import { logError, logInfo, logWarning, logSuccess} from "../src/utils/logger";



logInfo("Running weekly tasks")


const deleteCache = async() => {
    const dbMemoryInfo = await redisClient.info('memory')
    logInfo(`Redis cache is being cleared`)

    logInfo(dbMemoryInfo)

    const reply = await redisClient.flushdb();  // delete redis database
    logInfo(`Redis response: ${reply}`)

    logInfo(`Redis cache is clear`)

}

const runWeeklyJobs = async() => {

    try {
        await deleteCache()
    } catch (error) {
        logError(JSON.stringify(error))
    }
    process.exit()
}

runWeeklyJobs()