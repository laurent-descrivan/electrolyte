#!/usr/bin/env python
# -*- coding: utf-8 -*-

import StringIO
from PIL import Image
from PIL import ExifTags

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
