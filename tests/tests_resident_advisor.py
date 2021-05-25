from bigbutton.resident_advisor import *
import pytest


def test_get_events_no_events():

    # Web pages that dont read properly should raise an error
    with pytest.raises(Exception):
        get_events_list_from_search_url(r'https://www.google.com/')

    with pytest.raises(Exception):
        get_events_list_from_search_url(r'https://www.residentadvisor.net/events/1424611')

    with pytest.raises(Exception):
        get_events_list_from_search_url(r'https://www.residentadvisor.net/dj/hunee')


def test_get_artists_no_artists():
    with pytest.raises(Exception):
        get_artists_from_event_url(r'httsp:www.google.com')

    with pytest.raises(Exception):
        get_artists_from_event_url(r'https://www.residentadvisor.net/dj/hunee')

    with pytest.raises(Exception):
        get_artists_from_event_url(r'https://www.residentadvisor.net/events/1424565')


def test_random_souncloud():
    generic_url = r'https://ra.co/events/uk/london?week=2021-05-20'
    searchurl = generic_url
    link = get_random_souncloud_from_search(searchurl)

def test_random_souncloud_fails():
    with pytest.raises(Exception):
        get_random_souncloud_from_search(r'https://www.google.com/')