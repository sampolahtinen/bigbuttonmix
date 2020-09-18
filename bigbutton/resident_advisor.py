import re

import pandas as pd
import requests
from bs4 import BeautifulSoup
from request_library import *

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

def get_artists_from_event(soup):
    """
    read event page and return list of links to artist pages
    :param soup:
    :return:
    """
    tags = soup.find('p', {'class': 'lineup large'}).find_all('a')
    return [t['href'] for t in tags]


def get_souncloud_from_artistpage(soup):
    """
    Returns a string url of the artists' soundcloud page
    :param soup:
    :return:
    """
    return soup.find('a', {'href': re.compile(r'soundcloud\.com/')})['href']
