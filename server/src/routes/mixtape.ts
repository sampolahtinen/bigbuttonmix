import router from './_shared'
import { Request, Response } from 'express-async-router'
import { mockSoundCloudResponse } from '../mocks/mockSoundcloudResponse'
import { getRandomRAEventArtistTrack } from '../utils/raScraper'
//import * from 'cors'
var cors = require('cors')

router.use(cors())

// this is the endpoint for the client to interact with the server
router.get(
  '/api/random-mix',
  async (req: Request, res: Response) => {
    console.log('hitting route')
    const randomEventTrackEmbedResponse = await getRandomRAEventArtistTrack()
    res.json(randomEventTrackEmbedResponse)
  }
)

export default router
