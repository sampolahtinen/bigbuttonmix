import re

import pandas as pd
import requests
from bs4 import BeautifulSoup
from bigbutton.request_library import *
import random

def href_resident_advisor(href):
    return 'https://www.residentadvisor.net' + href

def get_soup(url =r'https://www.residentadvisor.net/events/de/berlin/week/2020-09-18'):
    r = request_hidden(url)

    content = r.content

    soup = BeautifulSoup(content, 'lxml')
    return soup

def get_events_list_from_search(soup):
    """
    Soup object for the search list webpage
    :param soup:
    :return: list of dicts with href and name
    """
    links = []
    for article in soup.find_all('article',
                                 {'itemtype': "http://data-vocabulary.org/Event"}
                                 ):
        links.append(article.find('div').find('a').attrs)

    return links

def get_events_list_from_search_url(url):
    soup = get_soup(url)
    links = get_events_list_from_search(soup)
    if len(links)>0:
        return links
    else:
        raise Exception('No events found in {}'.format(url))

def get_artists_from_event(soup):
    """
    read event page and return list of links to artist pages
    :param soup:
    :return: urls
    """
    tags = soup.find('p', {'class': 'lineup large'}).find_all('a')
    if len(tags)>0:
        return [href_resident_advisor(t['href']) for t in tags]
    else:
        raise Exception('No artist links found on event page')

def get_artists_from_event_url(url):
    soup = get_soup(url)
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
    events = get_events_list_from_search_url(url)

    # get event urls
    event_urls = []
    for e in events:
        event_urls.append(href_resident_advisor(e['href']))

    # shuffle the list
    random.shuffle(event_urls)

    # iterate and take the first successful soundcloud link
    for event_url in event_urls:
        try:
            event_soup = get_soup(event_url)

            # get list of artists and shuffle
            artists = get_artists_from_event(event_soup)

            random.shuffle(artists)

            # iterate through list and take first successful souncloud link
            for artist in artists:
                try:
                    artist_soup = get_soup(artist)
                    link = get_souncloud_from_artistpage(artist_soup)
                    return link
                except:
                    continue
        except:
            continue


def main():
    search_url = r'https://www.residentadvisor.net/events/de/berlin/week/2020-09-18'
    link = get_random_souncloud_from_search(search_url)
    print(link)


if __name__ == '__main__':
    main()


