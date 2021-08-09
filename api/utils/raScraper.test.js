// https://jestjs.io/docs/getting-started
// yarn 


//import { getEventLinks } from '../utils/raScraper'
//'const library = require('cool-library')

// import in a node-friendly way
const {fetch} = require('node-fetch')

var test_url = 'https://ra.co/events/de/berlin?week=2022-07-16'


// todo: replace with actual function reference
console.log(test_url)
const response =  fetch(searchPageURL)
const body =  response.text()
const root = parse(body)
events = root.querySelectorAll('h3 > a[href^="/events"]').map(a => a.getAttribute('href'))

test('fetch event gives an array from default url', () => {
    expect(Array.isArray(events)).toBe(true);
}

)

