import { Browser, BrowserContext, Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import { blockedDomains, minimalArgs } from "./createChromiumBrowser";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

interface CrawlerType {
  browser: Browser;
}

export class Crawler implements CrawlerType {
  browser: any;
  page: Page;

  constructor() {
    this.browser = null;
    this.page = null;
  }

  public getPage() {
    return this.page;
  }

  public getBrowser() {
    return this.browser;
  }

  public async close() {
    await this.browser.close();
  }

  async init() {
    console.time("puppeteerInit");
    this.browser = await puppeteer.launch({
      args: minimalArgs,
      headless: true,
      ignoreHTTPSErrors: true,
    });

    const page = await this.browser.newPage();
    await page.setRequestInterception(true);

    page.on("request", (req) => {
      if (
        req.resourceType() === "image" ||
        req.resourceType() === "stylesheet" ||
        req.resourceType() === "font" ||
        req.resourceType() === "script" ||
        blockedDomains.some((domain) => req.url().includes(domain))
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    this.page = page;
    console.timeEnd("puppeteerInit");
  }
}
