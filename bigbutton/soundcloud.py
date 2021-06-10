import re

import pandas as pd
import requests
from pprint import pprint

from bs4 import BeautifulSoup
from bigbutton.request_library import *
#from request_library import *
import random

def href_to_url_SC(href):
    return r'https://soundcloud.com' + href

def get_soup_SC(url =r'https://soundcloud.com/john-digweed'):
    r = request_hidden(url)

    content = r.content

    soup = BeautifulSoup(content, 'lxml')
    return soup

def get_tracks_url_list_from_artist(soup):
    link_objs = soup.find_all('article', {'class': 'audible'})
    track_hrefs = [l.find('a')['href'] for l in link_objs]
    track_urls = [href_to_url_SC(tr) for tr in track_hrefs]
    return track_urls

def get_random_track_url_from_artist_soup(soup):
    """
    Select random track from artist's soundcloud page, verifying that it meets standard requirements
    :param soup: artist webpage bsoup
    :return: url string
    """
    track_urls = get_tracks_url_list_from_artist(soup)
    random.shuffle(track_urls)
    try:

        for track_url in track_urls:
            try:
                check_track_page(track_url)
                return track_url
            except:
                continue
    except:
        raise Exception('No valid tracks on artist page')

def get_embed_from_url(url):
    api_url = r'https://soundcloud.com/oembed?url='+url
    r = requests.get(api_url)
    json = r.json()
    return json

def get_random_track_embed_from_artist_url(url):
    soup = get_soup_SC(url)
    url = get_random_track_url_from_artist_soup(soup)
    embed = get_embed_from_url(url)
    return url



def check_track_page(url):
    #todo write function to check track page. raise exception if fail checks
    pass



if __name__ == '__main__':
    artist_url = r'https://soundcloud.com/john-digweed'
    soup = get_soup_SC(artist_url)
    track_url = get_random_track_url_from_artist_soup(soup)
    print(track_url)
    embed_json = get_embed_from_url(track_url)
    pprint(embed_json)