#! /app/.heroku/node/bin/node
import { redisClient } from "../src/server";
import { logError, logInfo, logWarning, logSuccess} from "../src/utils/logger";



logInfo("Running weekly tasks")


const deleteCache = async() => {
    const dbMemoryInfoStart = await redisClient.info('memory')
    logInfo(`Redis cache is being cleared:`)
    logInfo(`Memory info before clearing:`)
    logInfo(dbMemoryInfoStart)

    const reply = await redisClient.flushdb();  // delete redis database
    logInfo(`Redis response: ${reply}`)

    const dbMemoryInfoEnd = await redisClient.info('memory')
    logInfo(`Redis clearing is finished`)
    logInfo(`Memory info after clearing:`)
    logInfo(dbMemoryInfoEnd)   
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