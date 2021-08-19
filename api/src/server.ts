import { PORT } from "./constants";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import redis from "redis";
import dotenv from "dotenv";
import util from "util";
import { randomSoundcloudTrackRoute } from "./routes";

dotenv.config();

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});
//@ts-ignore
redisClient.get = util.promisify(redisClient.get);
//@ts-ignore
redisClient.set = util.promisify(redisClient.set);

export { redisClient };

const app = express();

const allowList = [
  "http://localhost:3000",
  "https://bigbutton-mix.herokuapp.com",
];

app.use(
  cors({
    origin: allowList,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(randomSoundcloudTrackRoute);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
