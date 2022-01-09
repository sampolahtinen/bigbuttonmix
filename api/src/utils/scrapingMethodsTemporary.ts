import axios from 'axios';
import { isEmpty } from 'ramda';
import { Page } from 'puppeteer';
import { redisClient } from '../server';
import { logError, logInfo, logWarning } from './logger';
import { REDIS_ENABLED} from '../constants';
import { ErrorMessages} from '../typeDefs';

import {
  EventArtist,
  EventDetails,
  EventMetaInfo,
  RaEventDetails
} from '../typeDefs';

const generateRandomNumber = (max: number) => Math.floor(Math.random() * max);

type SoundcloudOembedResponse = {
    version: number;
    type: string;
    provider_name: string;
    provider_url: string;
    height: string;
    width: string;
    title: string;
    description: string;
    thumbnail_url: string;
    html: string;
    author_name: string;
    author_url: string;
    widget_src: string;
    track_url: string;
  };
  
  const puppetRequest = async (
    page: Page,
    eventUrl: string,
    cssSelector: string,
    cb: (args: Element[]) => string[] | Record<string, string>[]
  ) => {
    logInfo(`Puppeteer scraping: ${eventUrl}`);
    logInfo(`Using selector: ${cssSelector}`);
  
    await page.goto(eventUrl);
  
    const elements = await page.$$eval(cssSelector, cb);
  
    return elements;
  };

// This function fetches event links from RA and throws and error if it is empty
export const getEventLinks = async (searchPageURL: string, page: Page) => {
    if (REDIS_ENABLED) {
      const cachedEvents = ((await redisClient.get(
        searchPageURL
      )) as unknown) as any;
  
      if (cachedEvents) {
        logInfo(`Using cached events for ${searchPageURL}`);
        logInfo(`Total events: ${JSON.parse(cachedEvents).length}`);
        return JSON.parse(cachedEvents);
      }
    }
  
    const events = await puppetRequest(
      page,
      searchPageURL,
      'h3 > a[href^="/events"]',
      elements => elements.map(e => e.getAttribute('href'))
    );
  
    logInfo('Number of events found:');
    logInfo(events.length);
  
    if (REDIS_ENABLED) {
      await redisClient.set(searchPageURL, JSON.stringify(events));
    }
  
    logInfo(`Total events: ${events.length}`);
  
    return events;
  };
  