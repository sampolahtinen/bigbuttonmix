import re

import pandas as pd
import requests
from bs4 import BeautifulSoup
from bigbutton.request_library import *
#from request_library import *
import random

def href_to_url_RA(href):
    return r'https://ra.co' + href

def get_soup_RA(url =r'https://ra.co/events/uk/london?week=2021-05-20'):
    r = request_hidden(url)

    content = r.content

    soup = BeautifulSoup(content, 'lxml')
    return soup

def get_events_list_from_search(soup):
    """
    Soup object for the search list webpage
    :param soup:
    :return: list of href in string format for event pages
    """
    links = soup.find_all('span',{'data-test-id':"event-listing-heading"})
    return [l['href'] for l in links]

def get_events_list_from_search_url(url):
    soup = get_soup_RA(url)
    links = get_events_list_from_search(soup)
    if len(links)>0:
        return links
    else:
        raise Exception('No events found in {}'.format(url))

def get_artists_from_event(soup):
    """
    read event page and return list of links to artist pages
    :param soup:
    :return: href strings for artist pages
    """
    lineup = soup.find('div', {'data-tracking-id': 'event-detail-lineup'})
    artists = lineup.find_all('a')
    if len(artists)>0:
        return [a['href'] for a in artists]
    else:
        raise Exception('No artist links found on event page')

def get_artists_from_event_url(url):
    soup = get_soup_RA(url)
    return get_artists_from_event(soup)

def get_souncloud_from_artistpage(soup):
    """
    Returns a string url of the artists' soundcloud page
    :param soup:
    :return:
    """
    try:
        link = soup.find('a', {'href': re.compile(r'soundcloud\.com/')})['href']
        return link
    except:
        raise Exception('No soundcloud link found')

def get_random_souncloud_from_search(url):
    event_hrefs = get_events_list_from_search_url(url)

    # shuffle the list
    random.shuffle(event_hrefs)

    # iterate and take the first successful soundcloud link
    for event_href in event_hrefs:
        try:
            event_url = href_to_url_RA(event_href)
            event_soup = get_soup_RA(event_url)

            # get list of artists and shuffle
            artist_hrefs = get_artists_from_event(event_soup)

            random.shuffle(artist_hrefs)

            # iterate through list and take first successful soundcloud link
            for artist_href in artist_hrefs:
                try:
                    artist_url = href_to_url_RA(artist_href)
                    artist_soup = get_soup_RA(artist_url)
                    link = get_souncloud_from_artistpage(artist_soup)
                    return link
                except:
                    continue
        except:
            continue


def main():
    search_url = r'https://ra.co/events/uk/london?week=2021-05-20'
    link = get_random_souncloud_from_search(search_url)
    print(link)


if __name__ == '__main__':
    main()


