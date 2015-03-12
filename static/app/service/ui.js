"use strict";

(function(){
	function UIService($rootScope, $compile) {
		var that = this;

		that.choice = function choice(header, choices) {
			var choiceTemplate = '<el-choice header="{{header}}" choices="choices" onclose="onclose()"></el-choice>';

			var scope = $rootScope.$new(true);
			var el;
			scope.header = header;
			scope.choices = choices;
			scope.onclose = function onclose() {
				el.remove();
				console.log("remdddd");
			};
			el = $compile(choiceTemplate)(scope);

			$(document.body).append(el);
		};
	};

	angular.module("electrolyte").service("uiService", UIService);
})();
