"use strict";

electrolyte.directive('elResponsive', function() {
	return {
		restrict: 'E',
		link: function (scope, element, attrs, $window) {
			var win = $(window);

			function resizeHandler() {
				scope.$apply(function(){
					scope.width = win.width();
				});
			};
			win.on("resize", resizeHandler);
			scope.$on('$destroy', function() {
				win.off("resize", resizeHandler);
			});

			scope.width = win.width();

			scope.responsiveFilter = function(width) {
				if (width < 768) {
					return "elXs" in attrs;
				} else if (width < 992) {
					return "elSm" in attrs;
				} else if (width < 1200) {
					return "elMd" in attrs;
				} else {
					return "elLg" in attrs;
				}
			};
		},
		transclude: true,
		template: '<div ng-if="responsiveFilter(width)"><ng-transclude></ng-transclude></div>'
	};
});
