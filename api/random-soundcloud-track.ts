import { getRandomRAEventArtistTrack } from './utils/raScraper'

// This is the endpoint for the client to interact with the server
export default async (req: Request, res: any) => {
    console.log('hitting route')
    const randomEventTrackEmbedResponse = await getRandomRAEventArtistTrack()
    res.json(randomEventTrackEmbedResponse)
}
