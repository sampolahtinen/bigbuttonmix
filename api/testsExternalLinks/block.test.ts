import { 
    getRandomRaEventArtists,
    getRandomSoundcloudTrack
} from '../src/utils/raScraper';
import { Crawler } from "../src/utils/Crawler";

const testArtistScPage = "https://soundcloud.com/answercoderequest"
const errorUrl = 'https://www.google.com' 


jest.setTimeout(15000)    

test('Scraper: random artist from search url', async () =>{
    const crawler = new Crawler();
    await crawler.init();
    const page =  await crawler.getPage();
    let searchInfo = await getRandomRaEventArtists(
                                    {country:'de',
                                    city:'berlin'},
                                    '2020-01-01',
                                    page
                                    );
    expect(searchInfo.eventLink.startsWith('https://ra.co/events/')).toBe(true)
    expect(searchInfo.randomEventScLink.startsWith('https://www.soundcloud.com/')).toBe(true)

}
);

test('Scraper: random track from artist soundcloud', async () =>{
    let track = await getRandomSoundcloudTrack(testArtistScPage)
    console.log(track)
    // Many tracks will start with the artist url but not all - eg. if there is a collab
    expect(track.startsWith('https://soundcloud.com/')).toBe(true)

    // We want it to raise an error if it finds no tracks
    // Not sure how to put this through with async functions
    //expect(async() => {await getRandomSoundcloudTrack(errorUrl)}).toThrow()
    
}
);
