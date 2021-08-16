import router from './router'
import { Request, Response } from 'express-async-router'
import { createChromiumBrowser } from '../utils/createChromiumBrowser'
import { getRandomRaEventArtists, getRandomSoundcloudTrack, generateSoundcloudEmbed } from '../utils/raScraper'

// const client = redis.createClient ({
    //     url : process.env.REDIS_URL
    // });

// This is the endpoint for the client to interact with the server
router.get(
  '/api/random-soundcloud-track',
  async (req: Request, res: Response) => {
    console.time('raFunction')
    
    const  { browser, page } = await createChromiumBrowser()
    const { location, week } = req.query
    
    try {
      const randomRaEventInfo = await getRandomRaEventArtists(location as string, week as string, page)
  
      const randomSoundcloudTrack = await getRandomSoundcloudTrack(randomRaEventInfo.randomEventScLink)
      console.log('SOUNDCLOUD TRACK: ', randomSoundcloudTrack)
      const soundcloudOembed = await generateSoundcloudEmbed(randomSoundcloudTrack)
      
      res.json({
        ...soundcloudOembed,
        ...randomRaEventInfo
      })
    } catch (error) {
      console.trace(error.message)
      res.status(500).send('Error')
    }

    console.timeEnd('raFunction')
  }
)

export default router
