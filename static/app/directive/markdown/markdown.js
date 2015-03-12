"use strict";

electrolyte.directive('elMarkdown', function() {
	return {
		restrict: 'E',
		scope: {
			elContent: "="
		},
		link: function (scope, element, attrs, ngModel) {
			scope.$watch("elContent", function(content) {
				if (content) {
					element.html(markdown.toHTML(content));
				} else {
					element.html("");
				}
			});
		}
		// template: '<div class="el-markdown"></div>'
	};
});
