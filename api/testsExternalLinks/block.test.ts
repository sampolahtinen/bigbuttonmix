import { 
    getRandomRaEventArtists
} from '../src/utils/raScraper';
import { Crawler } from "../src/utils/Crawler";


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