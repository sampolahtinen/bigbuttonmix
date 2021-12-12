import { PORT, REDIS_ENABLED } from "./constants";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import redis from "redis";
import dotenv from "dotenv";
import util from "util";
import booleanParser from "express-query-boolean";
import { randomSoundcloudTrackRoute } from "./routes";

dotenv.config();
console.log(process.env.NODE_ENV);
let redisClient;

if (REDIS_ENABLED){
    redisClient = redis.createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  });
  //@ts-ignore
  redisClient.get = util.promisify(redisClient.get);
  //@ts-ignore
  redisClient.set = util.promisify(redisClient.set);
}


export { redisClient };

const app = express();

app.use(
  cors()
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(booleanParser());
app.use(cookieParser());
app.use(randomSoundcloudTrackRoute);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
