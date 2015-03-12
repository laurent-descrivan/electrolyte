"use strict";

electrolyte.directive('elMobileviewContent', function ($timeout) {

	// In order to make ios "elastic" touch scrolling work on
	// document bottom twice in a row without ever moving the navbar,
	// we have to setup a workaround so that the document is never
	// positioned at the top. So the technique involve shifting
	// scrollTop of some pixels when it scrolls to zero.

	// Not tested on android yet

	// Quick and dirty mobile detection. Don't do this at home!
	var needScrollFix = screen.width < 768;

	return {
		restrict: 'E',
		link: function (scope, elem, attrs) {
			if (needScrollFix) {
				elem.addClass("mobileview-content-scrollfix")

				$timeout(function(){
					elem.scrollTop(1);
					elem.css("padding-top", "2px");
				}, 0);

				elem.on("scroll", function() {
					if (elem.scrollTop() === 0) {
						console.log("min",elem.scrollTop());
						elem.scrollTop(1);
						elem.css("padding-top", "2px");
						return;
					} else {
						var maxScroll = elem[0].scrollHeight - elem.innerHeight();
						if (elem.scrollTop() === maxScroll) {
							elem.scrollTop(maxScroll-1);
							console.log("maxs",maxScroll-1);
							elem.css("padding-top", "0px");
							return;
						}
					}
					elem.css("padding-top", "1px");
				});
			}
		},
		transclude: true,

		template: '<div ng-transclude></div>'
	};
});
