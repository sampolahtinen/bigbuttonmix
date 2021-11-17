#! /app/.heroku/node/bin/node
import { redisClient } from "../src/server";
import { logInfo } from "../src/utils/logger";
//import { logError, logInfo, logWarning, logSuccess} from "./logger"

const deleteCache = async() => {
    let size = await redisClient.DBSIZE(); 
    logInfo(`Database is being cleared, initial size: ${size}`)
    redisClient.flushdb();  // delete redis database
}

const runJobs = async() => {
    await deleteCache()
    process.exit()
}

runJobs()