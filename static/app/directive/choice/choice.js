"use strict";

electrolyte.directive('elChoice', function($timeout) {
	return {
		restrict: 'E',
		scope: {
			"elVisible": "=",
			"elBgClick": "&"
		},
		transclude: true,
		templateUrl: 'app/directive/choice/choice.html'
	};
});

electrolyte.directive('elChoiceItem', function($timeout) {
	var LONG_CLICK_DELAY = 1000;

	return {
		restrict: 'E',
		scope: {
			"elIcon": "@",
			"elLongIcon": "@",
			"elText": "@",
			"elLongText": "@",
			"elClick": "&",
			"elLongClick": "&"
		},
		link: function (scope, elem, attrs) {
			// Logic for handling clicks and longclicks
			// without being confused by all the mouse events

			scope.longClickTriggered = false;

			var longClickTimer;

			var mouseStopListener = function choiceItemMouseStopListener(){
				document.removeEventListener("mouseup", mouseStopListener, true);
				document.removeEventListener("touchend", mouseStopListener, true);
				$timeout.cancel(longClickTimer);
				$timeout(function(){
					scope.longClickTriggered = false;
				}, 100);
			};

			scope.click = function click(event) {
				event.stopPropagation();

				if (scope.longClickTriggered) {
					scope.elLongClick();
				} else {
					scope.elClick();
				}

				mouseStopListener();
			};

			var mouseStartListener = function choiceItemMouseStartListener(event) {
				scope.$apply(function(){
					scope.longClickTriggered = false;

					// Don't trigger long clicks if the attribute is not present
					if (attrs.elLongClick) {

						document.addEventListener("mouseup", mouseStopListener, true);
						document.addEventListener("touchend", mouseStopListener, true);

						longClickTimer = $timeout(function() {
							scope.longClickTriggered = true;
						}, LONG_CLICK_DELAY);
					}
				});
			};

			elem.on("mousedown", mouseStartListener);
			elem.on("touchstart", mouseStartListener);
		},
		transclude: true,
		templateUrl: 'app/directive/choice/choice-item.html'
	};
});
