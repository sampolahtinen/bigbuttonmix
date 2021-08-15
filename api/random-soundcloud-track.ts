// import { generateSoundcloudEmbed, getRandomRaEventArtists, getRandomSoundcloudTrack } from './src/utils/raScraper'
// import { createChromiumBrowser } from './src/utils/createChromiumBrowser';

// // This is the endpoint for the client to interact with the server
// export default async (req, res: any) => {
//     console.time('raFunction')
//     // const client = redis.createClient ({
//     //     url : process.env.REDIS_URL
//     // });
//     const  { browser, page } = await createChromiumBrowser()
//     const { location, week } = req.query
    
//     console.time('raRandomEventInfo')
//     const randomRaEventInfo = await getRandomRaEventArtists(location, week, page)
//     console.timeEnd('raRandomEventInfo')

//     const randomSoundcloudTrack = await getRandomSoundcloudTrack(randomRaEventInfo.randomEventScLink)
//     console.log('SOUNDCLOUD TRACK: ', randomSoundcloudTrack)
//     const soundcloudOembed = await generateSoundcloudEmbed(randomSoundcloudTrack)
//     console.timeEnd('raFunction')

//     res.json({
//         ...soundcloudOembed,
//         ...randomRaEventInfo
//     })
// }
