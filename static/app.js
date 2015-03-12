$(function() {
	// https://github.com/ftlabs/fastclick
	// Allows mobile devices to react quickly after tapping
	FastClick.attach(document.body.parentNode);
});

var makeCRCTable = function(){
	var c;
	var crcTable = [];
	for(var n =0; n < 256; n++){
		c = n;
		for(var k =0; k < 8; k++){
			c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
		}
		crcTable[n] = c;
	}
	return crcTable;
}

var crc32 = function(str) {
	var crcTable = window.crcTable || (window.crcTable = makeCRCTable());
	var crc = 0 ^ (-1);

	for (var i = 0; i < str.length; i++ ) {
		crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
	}
	return (crc ^ (-1)) >>> 0 ;
};

var electrolyte = angular.module("electrolyte", ['ngRoute', 'pageslide-directive', "ngTouch", "dcbImgFallback"]);

electrolyte.config(function($routeProvider, $locationProvider) {

	$routeProvider.
		when('/things/:thingId', {
			templateUrl: 'app/page/thing/thing.html',
			controller: 'ThingController'
		}).
		when('/stickers/:format', {
			templateUrl: 'app/page/stickers/stickers.html',
			controller: 'StickersController'
		}).
		otherwise({
			redirectTo: '/things/4'
		});
});

electrolyte.directive('elEan', function () {
	return {
		// Restrict tells AngularJS how you will be declaring your directive in the markup.
		// A = attribute, C = class, E = element and M = comment
		restrict: 'E',
		// The directive compiler actually happens before the $scope is available in AngularJS, therefore
		// You need to pass certain values into your scope. In this instance, you are passing the barcodeValue
		// attribute and telling it its equal. In other words where you use scope.barcodeValue.toString() below
		// You are able to do this because of the below declaration. There are other symbols you can use to tell
		// the compiler to do other things such as interpret the values as a method, but I'll let you investigate
		scope: {
			elCode: '@'
		},
		// The link function passes the element to the directive and allows you to manipulate the dom
		// You could event try to replace $(.ean) with just elem below, since you are passing the scope,
		// element and attribute to the function below, then using the jQuery plugin to do the rest.
		link: function (scope, elem, attrs) {
			// console.log("here", ""+attrs.elEan)
			var canvas = elem.find("canvas:first")
			window.truc = canvas;
			scope.$watch("elCode", function(value){
				console.log("here ratio",window.devicePixelRatio);
				canvas[0].width = elem.width() * window.devicePixelRatio*2;
				canvas[0].height = elem.height() * window.devicePixelRatio*2;
				// console.log(canvas[0].width, canvas[0].height);
				// console.log("watch", value);
				canvas.EAN13(""+value);
			});
		},

		template: '<canvas></canvas><div class="el-ratio"></div>'
	};
});

jQuery(function(){
	angular.bootstrap(document, ['electrolyte']);
});
