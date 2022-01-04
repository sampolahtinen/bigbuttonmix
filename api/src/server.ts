import { PORT, REDIS_ENABLED } from './constants';
import { schema } from './schema';
import { ApolloServer } from 'apollo-server';
import redis from 'redis';
import dotenv from 'dotenv';
import util from 'util';
import { getRandomEvent } from './utils/scrapeRandomEvent';
import { DataSource } from 'apollo-datasource';
import { RaScraper } from './typeDefs';

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

class RaScraper extends DataSource {
  constructor() {
    super();
  }
  getRandomEvent(args) {
    return getRandomEvent(args);
  }
}

const dataSources = () => ({
  raScraper: new RaScraper()
});

const server = new ApolloServer({
  schema,
  dataSources
});

const port = process.env.PORT || 4000;

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
