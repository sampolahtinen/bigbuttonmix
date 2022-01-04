import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import { blockedDomains, minimalArgs } from './createChromiumBrowser';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

export class Crawler {
  browser: any; // TS Bug, complains if Browser type is assigned
  page: Page;
  isReady: boolean;

  constructor() {
    this.browser = null;
    this.page = null;
    this.isReady = false;
  }

  public async getPage() {
    if (!this.page) {
      const newPage = await this.createPage();
      return newPage;
    }
    return this.page;
  }

  public getBrowser() {
    return this.browser;
  }

  public async close() {
    await this.browser.close();
  }

  public async closePage() {
    await this.page.close();
  }

  async createPage() {
    const page = await this.browser.newPage();
    await page.setRequestInterception(true);

    page.on('request', req => {
      if (
        req.resourceType() === 'image' ||
        req.resourceType() === 'stylesheet' ||
        req.resourceType() === 'font' ||
        req.resourceType() === 'script' ||
        blockedDomains.some(domain => req.url().includes(domain))
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    this.page = page;
    return page;
  }

  async init() {
    const timeBenchmark = process.hrtime();
    const NS_PER_SEC = 1e9;

    this.browser = await puppeteer.launch({
      args: minimalArgs,
      headless: true,
      ignoreHTTPSErrors: true
    });

    this.browser;

    const page = await this.browser.newPage();
    await page.setRequestInterception(true);

    page.on('request', req => {
      if (
        req.resourceType() === 'image' ||
        req.resourceType() === 'stylesheet' ||
        req.resourceType() === 'font' ||
        req.resourceType() === 'script' ||
        blockedDomains.some(domain => req.url().includes(domain))
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    this.page = page;
    this.isReady = true;
    const timeDiff = process.hrtime(timeBenchmark);
    console.log(
      `Puppeteer initiated in: ${
        (timeDiff[0], timeDiff[1] / NS_PER_SEC)
      } seconds `
    );
  }
}
