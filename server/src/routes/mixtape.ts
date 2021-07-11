import router from './_shared'
import { Request, Response } from 'express-async-router'
import { mockSoundCloudResponse } from '../mocks/mockSoundcloudResponse'
import { getRandomRAEventArtistTrack } from '../utils/raScraper'

router.get(
  '/api/random-mix',
  async (req: Request, res: Response) => {
    console.log('hitting route')
    const randomEventTrackEmbedResponse = await getRandomRAEventArtistTrack()
    res.json(randomEventTrackEmbedResponse)
  }
)

export default router
