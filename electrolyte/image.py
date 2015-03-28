#!/usr/bin/env python
# -*- coding: utf-8 -*-

import StringIO
from PIL import Image, ExifTags

# Reverse look for exif tag for orientation
for (k,v) in ExifTags.TAGS.iteritems():
	if v == 'Orientation':
		ExifTagOrientation = k
		break

# Based on http://www.lifl.fr/~riquetd/auto-rotating-pictures-using-pil.html
def autorotate(indata):
	"""
		This function autorotates a picture:
		If the picture metadata informs that it should
		be rotated on display, do rotate and reset metadata.
		This allows to be friendly with browsers that can't
		understand this orientation exif metadata.
	"""

	inbuffer = StringIO.StringIO(indata)

	image = Image.open(inbuffer)
	if not hasattr(image, '_getexif'):
		return indata
	exif = image._getexif()
	if not exif:
		return indata

	if ExifTagOrientation in exif:
		orientation = exif[ExifTagOrientation]

		rotate_values = {
			3: 180,
			6: 270,
			8: 90
		}

		if orientation in rotate_values:
			# Rotate and save the picture
			image = image.rotate(rotate_values[orientation])
			outbuffer = StringIO.StringIO()
			image.save(outbuffer, format="JPEG", quality=100)
			content = outbuffer.getvalue()
			outbuffer.close()
			return content

	return indata

def thumbnail_cover(image_data, new_width, new_height):
	"""
		This function resize a picture, but instead of pil's
		thumbnail function, this resize bigger and then crop
		so that the picture has no background color, and is
		always the correct size (like css background-size:cover)
	"""

	inbuffer = StringIO.StringIO(image_data)
	image = Image.open(inbuffer)

	old_width = image.size[0]
	old_height = image.size[1]
	old_ratio = float(old_width) / float(old_height)

	if not new_width:
		new_width = int(new_height * old_ratio)
	elif not new_height:
		new_height = int(new_width / old_ratio)

	new_ratio = float(new_width) / float(new_height)

	if new_ratio < old_ratio:
		corrected_width = int(new_height * old_ratio)
		image = image.resize((corrected_width, new_height), Image.ANTIALIAS)
		left = int((corrected_width - new_width) / 2.0)
		right = left + new_width
		image = image.crop((left, 0, right, new_height))
	elif new_ratio > old_ratio:
		corrected_height = int(new_width / old_ratio)
		image = image.resize((new_width, corrected_height), Image.ANTIALIAS)
		top = int((corrected_height - new_height) / 2.0)
		bottom = top + new_height
		image = image.crop((0, top, new_width, bottom))
	else:
		image = image.resize((new_width, new_height), Image.ANTIALIAS)

	outbuffer = StringIO.StringIO()
	image.save(outbuffer, format="JPEG", quality=100)
	content = outbuffer.getvalue()
	outbuffer.close()
	return content
