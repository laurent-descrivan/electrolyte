
electrolyte.controller('StickersController', function($scope, $routeParams, $http, $timeout) {
		$scope.top_mm = 10;
		$scope.right_mm = 20;
		$scope.bottom_mm = 10;
		$scope.left_mm = 10;
		$scope.h_mm = 4;
		$scope.v_mm = 4;

		$scope.x_nb = 4;
		$scope.y_nb = 4;
		$scope.truc = {"background": "red"};

		// $timeout(function(){ $scope.v_mm = 30;}, 1000);

		var number = $scope.x_nb * $scope.y_nb;

		$http.post('api/eans/reserve', {'number': number}).success(function(data) {
			console.log(data);

			$scope.eans = data;

			$scope.$watchGroup(["top_mm", "right_mm", "bottom_mm", "left_mm", "h_mm", "v_mm"], function() {
				$scope.tableContainerStyle = {
					"top":    ($scope.top_mm    - $scope.v_mm) + "mm",
					"right":  ($scope.right_mm  - $scope.h_mm) + "mm",
					"bottom": ($scope.bottom_mm - $scope.v_mm) + "mm",
					"left":   ($scope.left_mm   - $scope.h_mm) + "mm"
				};

				$scope.tableTableStyle = {
					"border-spacing": $scope.h_mm + "mm "+ $scope.v_mm + "mm"
				};

				var codes = [];
				var i=0;
				for (var y=0; y<$scope.y_nb; y++) {
					var row = [];
					for (var x=0; x<$scope.x_nb; x++) {
						row.push(data[i]);
						i++;
					}
					codes.push(row);
				}

				$scope.codes = codes;
				console.log(codes);
			});

		});

	(function() {
		var beforePrint = function() {
			console.log('Functionality to run before printing.');
		};
		var afterPrint = function() {
			console.log('Functionality to run after printing');
		};

		if (window.matchMedia) {
			var mediaQueryList = window.matchMedia('print');
			mediaQueryList.addListener(function(mql) {
				if (mql.matches) {
					beforePrint();
				} else {
					afterPrint();
				}
			});
		}

		window.onbeforeprint = beforePrint;
		window.onafterprint = afterPrint;
	}());


	// 	$scope.visualCode = function(ean) {
	// 		if (ean >= 1000000000000) {
	// 			return null;
	// 		} else {
	// 			// Workaround
	// 			//
	// 			// Math.ceil is not necessary, but with Chrome, when the function is called,
	// 			// after a number of times, it returnes a wrong value
	// 			//
	// 			// Hypothesis: chrome after detecting this function is called often, triggers
	// 			// an recompile that should optimize the execution speed, but instead makes
	// 			// wrong optimization assumptions and make errors.
	// 			//
	// 			// Tested with string "40000000002" that returned with Math.floor(crc / 26)
	// 			// 164432274 (correct) but then -758776 (incorrect) after ~400 times
	// 			// within a setTimeout 1ms loop.
	// 			// Bug triggered on Mac os 10.9.4 Chrome 37.0.2062.120
	// 			var crc = Math.ceil(crc32(""+ean));

	// 			var a = crc % 26 + 65;
	// 			var b = Math.floor(crc / 26) % 26 + 65;
	// 			return String.fromCharCode(a) + String.fromCharCode(b);
	// 		}
	// 	};
	// 	$scope.format = $routeParams.format
	// });
});

