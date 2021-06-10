import router from './_shared'
import { Request, Response } from 'express-async-router'
import { mockSoundCloudResponse } from '../mocks/mockSoundcloudResponse'

router.get(
  '/api/random-mix',
  async (req: Request, res: Response) => {
    console.log('hitting route')
    res.json(mockSoundCloudResponse)
  }
)

export default router
