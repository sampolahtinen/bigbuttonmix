"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChromiumBrowser = void 0;
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const chrome_aws_lambda_1 = __importDefault(require("chrome-aws-lambda"));
const user_agents_1 = __importDefault(require("user-agents"));
const blockedDomains = [
    "securepubads.g.doubleclick.net",
    "google-analytics.com",
    "p1.parsely.com",
    "live.ravelin.click",
    "stats.g.doubleclick.net",
    "a-v2.sndcdn.com"
];
const minimalArgs = [
    '--autoplay-policy=user-gesture-required',
    '--disable-background-networking',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-breakpad',
    '--disable-client-side-phishing-detection',
    '--disable-component-update',
    '--disable-default-apps',
    '--disable-dev-shm-usage',
    '--disable-domain-reliability',
    '--disable-extensions',
    '--disable-features=AudioServiceOutOfProcess',
    '--disable-hang-monitor',
    '--disable-ipc-flooding-protection',
    '--disable-notifications',
    '--disable-offer-store-unmasked-wallet-cards',
    '--disable-popup-blocking',
    '--disable-print-preview',
    '--disable-prompt-on-repost',
    '--disable-renderer-backgrounding',
    '--disable-setuid-sandbox',
    '--disable-speech-api',
    '--disable-sync',
    '--hide-scrollbars',
    '--ignore-gpu-blacklist',
    '--metrics-recording-only',
    '--mute-audio',
    '--no-default-browser-check',
    '--no-first-run',
    '--no-pings',
    '--no-sandbox',
    '--no-zygote',
    '--password-store=basic',
    '--use-gl=swiftshader',
    '--use-mock-keychain',
];
const createChromiumBrowser = async () => {
    console.time('chromeInit');
    const browser = process.env.AWS_EXECUTION_ENV
        ? await puppeteer_core_1.default.launch({
            args: [...chrome_aws_lambda_1.default.args, "--hide-scrollbars", "--disable-web-security"],
            defaultViewport: chrome_aws_lambda_1.default.defaultViewport,
            executablePath: await chrome_aws_lambda_1.default.executablePath,
            headless: true,
            ignoreHTTPSErrors: true,
        })
        : await puppeteer_core_1.default.launch({
            dumpio: false,
            args: minimalArgs,
            headless: true,
            ignoreHTTPSErrors: true,
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        });
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    const user = new user_agents_1.default().toString();
    await page.setUserAgent(user);
    page.on('request', (req) => {
        if (req.resourceType() === 'image'
            || req.resourceType() === 'stylesheet'
            || req.resourceType() === 'font'
            || req.resourceType() === 'script'
            || blockedDomains.some(domain => req.url().includes(domain))) {
            req.abort();
        }
        else {
            req.continue();
        }
    });
    console.timeEnd('chromeInit');
    return { browser, page };
};
exports.createChromiumBrowser = createChromiumBrowser;
//# sourceMappingURL=createChromiumBrowser.js.map