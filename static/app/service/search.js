"use strict";

(function(){
	function SearchBackendService($http, $rootScope, moderatedRunnerService) {
		var that = this;

		var REFRESH_DELAY_MS = 500;

		that.NewSearch = function NewSearch() {
			var searchRunner = moderatedRunnerService.NewRunner(REFRESH_DELAY_MS);

			var search = $rootScope.$new(true);
			search.query = {
				text: ""
			};
			search.result = [];

			search.$watch("query.text", function(queryText) {
				searchRunner(function(complete) {
					if (queryText) {
						$http.get("api/search?text=" + encodeURIComponent(queryText)).
							success(function(data){
								search.result = data.things;
								complete();
							}).
							error(function(){
								complete();
							});
					} else {
						search.result = [];
						complete();
					}
				});
			});

			return search;
		}
	}

	angular.module("electrolyte").service("searchBackendService", SearchBackendService);
})();
