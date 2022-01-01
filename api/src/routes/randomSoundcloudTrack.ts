import router from './router';
import { Request, Response } from 'express-async-router';
import {
  getRandomRaEventArtists,
  getRandomSoundcloudTrack,
  generateSoundcloudEmbed
} from '../utils/raScraper';
import { RETRY_LIMIT, ErrorMessages } from '../constants';
import { Crawler } from '../utils/Crawler';
import { logSuccess, logError, logWarning } from '../utils/logger';
import { isDev } from '../utils';

console.log('Starting crawler');
const crawler = new Crawler();
crawler.init();

let retryCount = 0;

type Location = {
  country: string;
  city: string;
};
// This is the endpoint for the client to interact with the server
router.get(
  '/api/random-soundcloud-track',
  async (req: Request, res: Response) => {
    console.log('raFunction');
    console.time('raFunction');

    let { country, city, date, autoPlay } = req.query;

    let location = {
      country,
      city
    };

    // if (isDev) {
    //   location = {
    //     country: 'de',
    //     city: 'berlin'
    //   };
    // }

    const page = await crawler.getPage();

    retryCount = 0;

    try {
      const randomRaEventDetails = await getRandomRaEventArtists(
        location as Location,
        date as string,
        page
      );

      logSuccess(`SOUNDCLOUD LINK: ${randomRaEventDetails.randomEventScLink}`);

      const randomSoundcloudTrack = await getRandomSoundcloudTrack(
        randomRaEventDetails.randomEventScLink
      );
      logSuccess(`SOUNDCLOUD TRACK: ${randomSoundcloudTrack}`);

      const soundcloudOembed = await generateSoundcloudEmbed(
        randomSoundcloudTrack,
        // Should extendx Red.query type definitions
        (autoPlay as unknown) as boolean
      );

      res.json({
        ...soundcloudOembed,
        ...randomRaEventDetails
      });
    } catch (error) {
      console.trace()
      logError(error);

      if (error.message === ErrorMessages.NoEvents) {
        res.status(404).json({ message: ErrorMessages.NoEvents})
      }

      if (retryCount < RETRY_LIMIT) {
        logError('GENERAL ERROR. RETRYING PREVIOUS REQUEST!');
        retryCount++;
        res.redirect(req.originalUrl);
      } else {
        res.status(408).json('Request Timeout');
      }
    }

    console.timeEnd('raFunction');
  }
);

export default router;
