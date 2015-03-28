"use strict";

electrolyte.directive('elThingPreview', function($location, barcodeService) {
	return {
		restrict: 'E',
		scope: {
			"elThing": "=",
			"elClick": "&",
			"elHighlight": "=",
		},
		link: function (scope, element, attrs) {

			scope.eanVisualCode = barcodeService.eanVisualCode;

			scope.click = function click() {
				if (attrs.elClick) {
					scope.elClick(scope.elThing);
				} else {
					// Default click behavior: go to thing
					$location.path("/things/"+scope.elThing.id);
				}
			};

			scope.getImageUrl = function getImageUrl(image_id) {
				if (image_id) {
					return "/api/blobs/"+image_id+"?width=128&height=128";
				} else {
					return "/app/directive/thing/preview/grey_bg.png";
				}
			};
		},
		templateUrl: 'app/directive/thing/preview/thing_preview.html'
	};
});
