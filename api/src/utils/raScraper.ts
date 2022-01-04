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

const s = 122;

export class RaScraper extends DataSource {
  crawler: Crawler;
  retryCount: number;

  constructor(crawler: Crawler) {
    super();
    this.crawler = crawler;
    this.retryCount = 0;
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
      let step = 1;

      while (step < 3 || this.retryCount === RETRY_LIMIT) {
        try {
          if (step === 1) {
            randomRaEventDetails = await getRandomRaEventArtists(
              location,
              date,
              page
            );

            logSuccess(
              `SOUNDCLOUD LINK: ${randomRaEventDetails.randomEventScLink}`
            );
            step = 2;
          }

          if (step === 2) {
            randomSoundcloudTrack = await getRandomSoundcloudTrack(
              randomRaEventDetails.randomEventScLink
            );

            logSuccess(`SOUNDCLOUD TRACK: ${randomSoundcloudTrack}`);

            step = 3;
          }

          if (step === 3) {
            throw new Error('mooock');
            // const soundcloudOembed = await generateSoundcloudEmbed(
            //   randomSoundcloudTrack,
            //   autoPlay
            // );

            // resolve({
            //   ...randomRaEventDetails,
            //   randomTrack: soundcloudOembed
            // });
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
            logError('GENERAL ERROR. RETRYING PREVIOUS REQUEST!');
            this.retryCount = this.retryCount + 1;
            setTimeout(() => {
              step = 1;
            }, 300);
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
