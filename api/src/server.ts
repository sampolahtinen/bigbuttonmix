import { PORT, REDIS_ENABLED } from './constants';
import { schema } from './schema';
import { ApolloServer } from 'apollo-server';
import redis from 'redis';
import dotenv from 'dotenv';
import util from 'util';
import { getRandomEvent } from './routes/randomSoundcloudTrack';
import { DataSource } from 'apollo-datasource';

dotenv.config();
console.log(process.env.NODE_ENV);

let redisClient;

if (REDIS_ENABLED) {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });
  //@ts-ignore
  redisClient.get = util.promisify(redisClient.get);
  //@ts-ignore
  redisClient.set = util.promisify(redisClient.set);

  redisClient.flushdb = util.promisify(redisClient.flushdb);

  redisClient.info = util.promisify(redisClient.info);
}

export { redisClient };

const dataSources = () => ({
  raScraper: {
    getRandomEvent
  }
});

class RaScraper extends DataSource {
  constructor() {
    super();
  }
  getRandomEvent(args) {
    return getRandomEvent(args);
  }
}

const server = new ApolloServer({
  schema,
  dataSources: () => {
    return {
      raScraper: new RaScraper()
    };
  }
});

const port = process.env.PORT || 4000;

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
