#!/usr/bin/env python
# -*- coding: utf-8 -*-

""" Cornice services.
"""
from cornice import Service
from pyramid.response import Response
import db
import image
import hashlib

thing = Service(name='things', path='/things/{id}', description="Thing resource", renderer="jsonplusplus")

@thing.get()
def get_thing(request):
	"""Returns a thing in JSON."""
	thing = db.get_thing(request.matchdict['id'])
	if thing:
		return {
			"found": True,
			"thing": thing,
			"ancestors": db.get_thing_ancestors(request.matchdict['id']),
			"children": db.get_thing_children(request.matchdict['id']),
			"log": db.get_thing_log(request.matchdict['id']),
		}
	else:
		return {
			"found": False,
			"thing": {
				"id": long(request.matchdict['id']),
			},
			"log": db.get_thing_log(request.matchdict['id']),
		}


@thing.put()
def put_thing(request):
	"""Sets a thing."""
	thing = request.json_body
	thing["ip"] = request.client_addr
	thing["author"] = request.client_addr
	db.put_thing(thing)
	return {}

eans = Service(name='eans', path='/eans/reserve', description="Code resource")

@eans.post()
def reserve_eans(request):
	"""Returns a thing in JSON."""

	# TODO: fetch here real data
	return [
		"040000131132", "040000131134", "040000131443",
		"040000231132", "040000231134", "040000231443",
		"040000331132", "040000331134", "040000331443",
		"040000431132", "040000431134", "040000431443",
		"040000531132", "040000531134", "040000531443",
		"040000631132", "040000631134", "040000631443",
		"040000731132", "040000731134", "040000731443",
		"040000831132", "040000831134", "040000831443",
	]



blobs = Service(name='blobss', path='/blobs', description="Blob resource")

@blobs.post()
def post_blob(request):
	if request.content_type not in ('image/png', 'image/jpeg'):
		raise Exception("Invalid content type")

	output_data = image.autorotate(request.body)

	blob_id = hashlib.sha256(output_data).hexdigest()

	blob = {
		"id": blob_id,
		"content_type": request.content_type,
		"length": len(output_data),
		"content": output_data,
	}
	db.put_blob(blob)
	return { "id": blob_id }


blob = Service(name='blobs', path='/blobs/{id}', description="Blob resource")

@blob.get()
def get_blob(request):
	sha = request.matchdict['id']
	if sha in request.if_none_match:
		return Response(
			status_code=304,
			content_type="",
			cache_control="public, max-age=86400",
			etag=sha,
		)
	else:
		blob = db.get_blob(sha)
		content = blob["content"]
		width  = request.params.get('width', None)
		height = request.params.get('height', None)
		content = image.thumbnail_cover(content, int(width), int(height))
		return Response(
			content_type=str(blob["content_type"]),
			body=content,
			cache_control="public; max-age=86400",
			etag=sha,
		)


search = Service(name='search', path='/search', description="Search resource")

@search.get()
def search_thing(request):
	"""Returns a collection of things related to text param."""
	return {
		"things": db.search(request.GET["text"]),
	}
