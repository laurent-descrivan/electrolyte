#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""Main entry point
"""
from pyramid.config import Configurator
import os

def main(global_config, **settings):
    config = Configurator(settings=settings)
    config.include("cornice")
    config.scan("electrolyte.views")
    config.add_static_view(name='', path=os.path.join(os.path.dirname(__file__), '..', 'static'), cache_max_age=0)
    return config.make_wsgi_app()
