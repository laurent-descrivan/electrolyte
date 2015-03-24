"use strict";

electrolyte.directive('elThingLogentry', function($location, barcodeService) {
	return {
		restrict: 'E',
		scope: {
			"elLogentry": "=",
		},
		link: function (scope, element, attrs) {
			function zeroPrefix(i) {
				i = "" + i;
				return "00".substring(i.length) + i;
			};
			scope.displayDate = function displayDate(timestamp) {
				var d = new Date(timestamp);
				return zeroPrefix(d.getDate()) + "/" + zeroPrefix(d.getMonth()) + "/" + d.getFullYear();
			};
		},
		templateUrl: 'app/directive/thing/logentry/thing_logentry.html'
	};
});
