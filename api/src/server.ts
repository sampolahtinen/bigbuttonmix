import { ApolloServer } from 'apollo-server';
import redis from 'redis';
import dotenv from 'dotenv';
import util from 'util';
import chalk from 'chalk';
import { REDIS_ENABLED } from './constants';
import { schema } from './schema';
import { RaScraper } from './utils/RaScraper';
import { Crawler } from './utils/Crawler';

dotenv.config();
console.log(`${chalk.blue('ENVIRONMENT:')} ${process.env.NODE_ENV}`);

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

const crawler = new Crawler();

crawler.init().then(() => {
  const dataSources = () => ({
    raScraper: new RaScraper(crawler)
  });

  const server = new ApolloServer({
    schema,
    dataSources
  });

  server.listen().then(({ url }) => {
    console.log(chalk.green(`🚀 Server ready at ${url}`));
  });
});
