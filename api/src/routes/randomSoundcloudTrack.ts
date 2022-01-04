import {
  getRandomRaEventArtists,
  getRandomSoundcloudTrack,
  generateSoundcloudEmbed
} from '../utils/raScraper';
import { RETRY_LIMIT, ErrorMessages } from '../constants';
import { Crawler } from '../utils/Crawler';
import { logSuccess, logError } from '../utils/logger';
import { RaEventDetails } from '../types';

console.log('Starting crawler');
const crawler = new Crawler();
crawler.init();

let retryCount = 0;

type Location = {
  country: string;
  city: string;
};

type EventArgs = {
  city: string;
  country: string;
  date: string; // Format: "2022-01-04" YYYY-MM-DD
  autoPlay?: boolean;
};

export const getRandomEvent = (args: EventArgs) =>
  new Promise(async (resolve, reject) => {
    console.log('raFunction');
    console.time('raFunction');

    let { country, city, date, autoPlay } = args;

    let location: Location = {
      country,
      city
    };

    const page = await crawler.getPage();

    retryCount = 0;

    let randomRaEventDetails: RaEventDetails;
    let randomSoundcloudTrack: string;

    let step = 1;

    while (step < 3) {
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

        if ((step = 3)) {
          const soundcloudOembed = await generateSoundcloudEmbed(
            randomSoundcloudTrack,
            // Should extend Red.query type definitions
            autoPlay
          );

          // resolve(randomRaEventDetails);
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

        if (retryCount < RETRY_LIMIT) {
          logError('GENERAL ERROR. RETRYING PREVIOUS REQUEST!');
          setTimeout(() => {
            retryCount++;
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
