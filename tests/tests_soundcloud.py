from bigbutton.soundcloud import *
import pytest

artist_url = r'https://soundcloud.com/john-digweed'
artist_soup = get_soup_SC(artist_url)


def test_get_tracks_no_tracks():
    # Web pages that dont read properly should raise an error
    with pytest.raises(Exception):
        get_tracks_url_list_from_artist(r'https:www.google.com')

def test_get_track_urls():
    track_urls = get_tracks_url_list_from_artist(artist_soup)

def test_get_track_url_random():
    track_url_random = get_random_track_from_artist(artist_soup)