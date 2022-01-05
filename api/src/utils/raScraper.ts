import { ErrorMessages, RETRY_LIMIT } from '../constants';
import { EventArgs, RandomEventResponse, RaEventDetails } from '../typeDefs';
import { Crawler } from './Crawler';
import { logSuccess, logError } from './logger';
import { DataSource } from 'apollo-datasource';
import {
  generateSoundcloudEmbed,
  getRandomRaEventArtists,
  getRandomSoundcloudTrack
} from './scrapingMethods';

/**
 *
 * @param time string - milliseconds
 * @returns Promise: string
 */
const wait = async (time: number = 100): Promise<string> =>
  new Promise(resolve =>
    setTimeout(() => {
      resolve('ók');
    }, time)
  );

export class RaScraper extends DataSource {
  crawler: Crawler;
  retryCount: number;
  step: number;

  constructor(crawler: Crawler) {
    super();
    this.crawler = crawler;
    this.retryCount = 0;
    this.step = 1;
  }

  getRandomEvent = (args: EventArgs): Promise<RandomEventResponse> =>
    new Promise(async (resolve, reject) => {
      console.log('raFunction');
      console.time('raFunction');

      let { country, city, date, autoPlay } = args;

      let location = {
        country,
        city
      };

      const page = await this.crawler.getPage();

      let randomRaEventDetails: RaEventDetails;
      let randomSoundcloudTrack: string;

      while (this.step < 3 || this.retryCount !== RETRY_LIMIT) {
        try {
          if (this.step === 1) {
            randomRaEventDetails = await getRandomRaEventArtists(
              location,
              date,
              page
            );

            logSuccess(
              `SOUNDCLOUD LINK: ${randomRaEventDetails.randomEventScLink}`
            );
            this.step = 2;
          }

          if (this.step === 2) {
            randomSoundcloudTrack = await getRandomSoundcloudTrack(
              randomRaEventDetails.randomEventScLink
            );

            logSuccess(`SOUNDCLOUD TRACK: ${randomSoundcloudTrack}`);

            this.step = 3;
          }

          if (this.step === 3) {
            const soundcloudOembed = await generateSoundcloudEmbed(
              randomSoundcloudTrack,
              autoPlay
            );

            resolve({
              ...randomRaEventDetails,
              randomTrack: soundcloudOembed
            });
          }
        } catch (error) {
          console.trace();
          logError(error);

          if (error.message === ErrorMessages.NoEvents) {
            reject({
              status: 404,
              message: ErrorMessages.NoEvents
            });
          }

          if (this.retryCount < RETRY_LIMIT) {
            logError('GENERAL ERROR. RETRYING!');
            await wait(100);
            this.retryCount = this.retryCount + 1;
            this.step = 1;
          } else {
            reject({
              status: 408,
              message: 'Timeout'
            });
          }
        }
      }

      console.timeEnd('raFunction');
    });
}
