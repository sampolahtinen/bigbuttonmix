import { getRandomRAEventArtistTrack } from './utils/raScraper'

// This is the endpoint for the client to interact with the server
export default async (req: Request, res: any) => {
    console.log('hitting route')
    console.time('raFunction')
    
    const randomEventTrackEmbedResponse = await getRandomRAEventArtistTrack()
    
    console.timeEnd('raFunction')
    res.json(randomEventTrackEmbedResponse)
}
