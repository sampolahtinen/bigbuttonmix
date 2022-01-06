import { ApolloServer } from 'apollo-server';
import * as redis from 'redis';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { REDIS_ENABLED } from './constants';
import { schema } from './schema';
import { RaScraper } from './utils/RaScraper';
import { Crawler } from './utils/Crawler';

dotenv.config();
console.log(`${chalk.blue('ENVIRONMENT:')} ${process.env.NODE_ENV}`);

const redisClient = REDIS_ENABLED
  ? redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    })
  : null;

export { redisClient };

const crawler = new Crawler();

crawler.init().then(async () => {
  if (redisClient) {
    console.log('Connecting to redis...');
    await redisClient.connect();
  }

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
