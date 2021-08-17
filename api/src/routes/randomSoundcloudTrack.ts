import router from './router'
import { Request, Response } from 'express-async-router'
import { createChromiumBrowser } from '../utils/createChromiumBrowser'
import { getRandomRaEventArtists, getRandomSoundcloudTrack, generateSoundcloudEmbed } from '../utils/raScraper'
import { RETRY_LIMIT } from '../constants'

// const client = redis.createClient ({
    //     url : process.env.REDIS_URL
    // });

let retryCount = 0
// This is the endpoint for the client to interact with the server
router.get(
  '/api/random-soundcloud-track',
  async (req: Request, res: Response) => {
    console.time('raFunction')
  
    const  { browser, page } = await createChromiumBrowser()
    const { location, week } = req.query
    
    try {
      const randomRaEventInfo = await getRandomRaEventArtists(location as string, week as string, page as any)
      console.log('SOUNDCLOUD LINK: ', randomRaEventInfo.randomEventScLink)

      const randomSoundcloudTrack = await getRandomSoundcloudTrack(randomRaEventInfo.randomEventScLink)
      console.log('SOUNDCLOUD TRACK: ', randomSoundcloudTrack)

      const soundcloudOembed = await generateSoundcloudEmbed(randomSoundcloudTrack)
      
      await browser.close()
      
      retryCount = 0;
      
      res.json({
        ...soundcloudOembed,
        ...randomRaEventInfo
      })

    } catch (error) {
      await browser.close()
      if (retryCount < RETRY_LIMIT) {
        console.error('GENERAL ERROR. RETRYING PREVIOUS REQUEST!')
        retryCount++
        res.redirect(req.originalUrl)
      } else {
        res.status(408).json('Request Timeout')
      }
    }

    console.timeEnd('raFunction')
  }
)

export default router
