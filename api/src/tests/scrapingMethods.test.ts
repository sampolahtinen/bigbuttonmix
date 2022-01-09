import {getEventLinks} from '../utils/scrapingMethodsTemporary';
import { Crawler } from "../utils/Crawler";
import { isExportDeclaration } from 'typescript';
//import {expect} from jest;
import { isNumberObject } from 'util/types';

const testRaSearchUrlDynamic = 'https://ra.co/events/de/berlin'
const testRaSearchUrlStatic = '' // add a historical week
console.log('Testing')

//https://github.com/Microsoft/TypeScript/issues/31226
test('dummy test');

test('Sraper: event links today', async () =>{

    const crawler = new Crawler();
    await crawler.init();
    const page =  await crawler.getPage();

    const eventLinks = await getEventLinks(testRaSearchUrlDynamic,page);

    expect(eventLinks[0]).not.toBeNull()

    const numberOfEvents = eventLinks.length;
    expect(numberOfEvents).toBeGreaterThan(0)
    
    


}


);