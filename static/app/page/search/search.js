"use strict";

electrolyte.directive('elPageSearch', function($location, searchBackendService, barcodeService, nav) {
	return {
		restrict: 'E',
		scope: {},
		controller: function($scope) {
			$scope.search = searchBackendService.NewSearch();
			$scope.clickBarcodeInput = function clickBarcodeInput() {
				barcodeService.askForBarcode("Recherche par code", function(code) {
					// Default click behavior: go to thing
					$location.path("/things/"+code);
					nav.tab = nav.DESCRIPTION;
				});
			};
		},
		templateUrl: 'app/page/search/search.html'
	};
});
