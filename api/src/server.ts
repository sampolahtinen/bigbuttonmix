import 'dotenv/config';
import { ApolloServer } from 'apollo-server';
import bluebird from 'bluebird';
import chalk from 'chalk';
import * as redis from 'redis';
import { PORT, REDIS_ENABLED } from './constants';
import { schema } from './schema';
import { Crawler } from './utils/Crawler';
import { RaScraper } from './utils/RaScraper';

bluebird.promisifyAll((<any>redis).RedisClient.prototype);
bluebird.promisifyAll((<any>redis).Multi.prototype);

console.log(`${chalk.blue('ENVIRONMENT:')} ${process.env.NODE_ENV}`);

console.log('Connecting to redis...');

const redisClient = REDIS_ENABLED
  ? redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    })
  : null;

export { redisClient };

const crawler = new Crawler();

crawler.init().then(async () => {
  // if (redisClient) {
  //   console.log('Connecting to redis...');
  //   await redisClient.connect();
  // }

  const dataSources = () => ({
    raScraper: new RaScraper(crawler)
  });

  const server = new ApolloServer({
    schema,
    dataSources
  });

  server.listen({ port: PORT }).then(({ url, server }) => {
    server.setTimeout(10 * 60 * 1000); // 10 minutes
    console.log(chalk.green(`🚀 Server ready at ${url}`));
  });
});
