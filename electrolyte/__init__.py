#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""Main entry point
"""
from pyramid.config import Configurator
from pyramid.renderers import JSON
import json
import os

def main(global_config, **settings):
    config = Configurator(settings=settings)
    config.include("cornice")
    config.add_renderer('jsonplusplus', JSON(serializer=renderer_json_default))
    config.scan("electrolyte.views")
    config.add_static_view(name='', path=os.path.join(os.path.dirname(__file__), '..', 'static'), cache_max_age=0)
    return config.make_wsgi_app()

def renderer_json_default(obj, **ka):
    return json.dumps(obj, default=json_dumps_default)

def json_dumps_default(obj):
    """Default JSON serializer."""
    import calendar, datetime

    if isinstance(obj, datetime.datetime):
        if obj.utcoffset() is not None:
            obj = obj - obj.utcoffset()
    millis = int(
        calendar.timegm(obj.timetuple()) * 1000 +
        obj.microsecond / 1000
    )
    return millis
