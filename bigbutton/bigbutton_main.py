from bigbutton.request_library import *
from bigbutton.resident_advisor import *
from bigbutton.soundcloud import *

def bigbutton_search(search_url):
    soundcloud_artist_url = get_random_soundcloud_from_search(search_url)
    soundcloud_track_embed = get_random_track_embed_from_artist_url(soundcloud_artist_url)
    return soundcloud_track_embed

if __name__ == '__main__':
    search_url = r'https://ra.co/events/uk/london?week=2021-05-20'
    embed_json = bigbutton_search(search_url)
    pprint(embed_json)

