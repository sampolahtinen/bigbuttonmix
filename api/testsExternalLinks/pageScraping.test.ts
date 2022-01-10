import { 
    getEventLinks,
    getRaEventDetails,
    getSoundCloudLinkFromArtist,
    getSoundcloudTracks
} from '../src/utils/raScraper';
import { Crawler } from "../src/utils/Crawler";

const testRaSearchUrlDynamic = 'https://ra.co/events/de/berlin'
const testRaSearchUrlStatic = 'https://ra.co/events/de/berlin?week=2020-01-01'
const junkUrl = 'https://www.google.com' 
const testEventUrl = 'https://ra.co/events/1346308'
const testArtistRaPage = 'https://ra.co/dj/answercoderequest'
const testArtistScPage = "https://soundcloud.com/answercoderequest"
jest.setTimeout(15000)    


test('Scraper: event links today', async () =>{
    const crawler = new Crawler();
    await crawler.init();
    const page =  await crawler.getPage();

    const eventLinks = await getEventLinks(testRaSearchUrlDynamic,page);

    expect(eventLinks[0]).not.toBeNull()

    const numberOfEvents = eventLinks.length;
    expect(numberOfEvents).toBeGreaterThan(0)
}
);

test('Scraper: event links historical search', async () =>{
    const crawler = new Crawler();
    await crawler.init();
    const page =  await crawler.getPage();
    const eventLinks = await getEventLinks(testRaSearchUrlStatic,page);
    // the first event of this search page
    expect(eventLinks[0]).toBe("/events/1346308")

    const numberOfEvents = eventLinks.length;
    expect(numberOfEvents).toBe(300)
}
);


test('Scraper: event details', async () =>{
    const crawler = new Crawler();
    await crawler.init();
    const page =  await crawler.getPage();
    let eventDetails = await getRaEventDetails(page, testEventUrl);

    expect(eventDetails.artists[0].profileLink).toBe("/dj/answercoderequest")

    expect(eventDetails.artists.length).toBe(51)
}
);

test('Scraper: artist RA page', async () =>{
    const crawler = new Crawler();
    await crawler.init();
    const page =  await crawler.getPage();
    let scLink = await getSoundCloudLinkFromArtist(page, testArtistRaPage);

    expect(scLink).toBe("https://www.soundcloud.com/answercoderequest")
}
);



// Artist may upload new tracks so we can't refer to length or specific track
test('Scraper: artist SC page', async () =>{
    let tracks = await getSoundcloudTracks(testArtistScPage);
    expect(tracks.length).not.toBe(0)

}
);


