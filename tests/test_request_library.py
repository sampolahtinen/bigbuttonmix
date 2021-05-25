from bigbutton.request_library import *
import pytest


def test_request_hidden():
    google = r'https://www.google.com/'
    r = request_hidden(google)
    assert r.status_code == 200