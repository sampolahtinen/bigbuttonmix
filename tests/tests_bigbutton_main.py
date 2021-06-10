from bigbutton.bigbutton_main import *
import pytest

def test_bigbutton():
    test_url = r'https://ra.co/events/uk/london?week=2021-05-20'
    soundcloud_url = bigbutton_search(test_url)
