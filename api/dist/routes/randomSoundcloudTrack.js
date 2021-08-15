"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = __importDefault(require("./router"));
const createChromiumBrowser_1 = require("../utils/createChromiumBrowser");
const raScraper_1 = require("../utils/raScraper");
// const client = redis.createClient ({
//     url : process.env.REDIS_URL
// });
// This is the endpoint for the client to interact with the server
router_1.default.get('/api/random-soundcloud-track', async (req, res) => {
    console.time('raFunction');
    const { browser, page } = await createChromiumBrowser_1.createChromiumBrowser();
    const { location, week } = req.query;
    console.time('raRandomEventInfo');
    const randomRaEventInfo = await raScraper_1.getRandomRaEventArtists(location, week, page);
    console.timeEnd('raRandomEventInfo');
    const randomSoundcloudTrack = await raScraper_1.getRandomSoundcloudTrack(randomRaEventInfo.randomEventScLink);
    console.log('SOUNDCLOUD TRACK: ', randomSoundcloudTrack);
    const soundcloudOembed = await raScraper_1.generateSoundcloudEmbed(randomSoundcloudTrack);
    console.timeEnd('raFunction');
    res.json(Object.assign(Object.assign({}, soundcloudOembed), randomRaEventInfo));
});
exports.default = router_1.default;
//# sourceMappingURL=randomSoundcloudTrack.js.map