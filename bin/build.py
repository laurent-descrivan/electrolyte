#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os, fnmatch

os.chdir(os.path.join(os.path.dirname(__file__), ".."))

INDEX_HEADER = """<!DOCTYPE html>
<html>
	<head>
		<title>Electrolyte</title>

		<meta name="viewport" content="width=device-width, user-scalable=no, minimal-ui">
		<meta name="apple-mobile-web-app-capable" content="yes">

		<link rel="stylesheet" type="text/css" href="lib/font-awesome-4.2.0/css/font-awesome.min.css">
		<link rel="stylesheet" type="text/css" href="lib/bootstrap/css/bootstrap.css">

		<script type="text/javascript" src="lib/jquery-2.1.1.js"></script>
		<script type="text/javascript" src="lib/jquery-autosize.js"></script>
		<script type="text/javascript" src="lib/jquery-ean13.js"></script>
		<script type="text/javascript" src="lib/fastclick.js"></script>
		<script type="text/javascript" src="lib/angular.js"></script>
		<script type="text/javascript" src="lib/angular-route.js"></script>
		<script type="text/javascript" src="lib/angular-touch.js"></script>
		<script type="text/javascript" src="lib/angular-pageslide-directive.js"></script>
		<script type="text/javascript" src="lib/angular.dcb-img-fallback.js"></script>
		<script type="text/javascript" src="lib/bootstrap/js/bootstrap.js"></script>
		<script type="text/javascript" src="lib/markdown.js"></script>

		<link rel="stylesheet" type="text/css" href="app.css">

		<script type="text/javascript" src="app.js"></script>
"""

INDEX_FOOTER = """
	</head>
	<body style="-webkit-overflow-scrolling: touch;">
		<div class="el-app" ng-view>
		</div>
	</body>
</html>
"""

STATIC_PATH = "./static/"

TAGS = {
	"app/**/*.css": '<link rel="stylesheet" type="text/css" href="%s">',
	"app/**/*.js":  '<script type="text/javascript" src="%s"></script>',
}

def main():

	with open('./static/index.html', 'w') as out:
		out.write(INDEX_HEADER)

		for pattern, tag in TAGS.iteritems():
			prefix, filter = pattern.split("/**/")

			# matches = []
			for root, dirnames, filenames in os.walk(STATIC_PATH+prefix):
				for filename in fnmatch.filter(filenames, filter):
					filepath = root[len(STATIC_PATH):]+"/"+filename
					out.write("\t\t" + (tag % filepath) + "\n")
		out.write(INDEX_FOOTER)

if __name__=="__main__":
	main()
