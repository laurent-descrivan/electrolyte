"use strict";

angular.module("electrolyte").controller('ThingController', function($scope, $location, $routeParams, $http, $timeout, uiService, modelSyncBackendService, virtualNumericInputService, nav, barcodeService, printerService, soundService) {

	$scope.menuVisible = false;
	$scope.menuShow = function menuShow() {
		$scope.menuVisible = true;
	}
	var menuHide = $scope.menuHide = function menuHide() {
		$scope.menuVisible = false;
	}
	$scope.menuClickBg = function menuClickBg() {
		menuHide();
	}
	$scope.menuDoImport = function menuDoImport() {
		barcodeService.askForBarcode("Importer depuis", function(code) {
			var id = parseInt(barcodeService.eanNormalize(code).substr(0,12), 10);
			$http.get('api/things/'+id).success(function(data) {
				if (data.found) {
					var src = data.thing;
					var dst = $scope.thing;
					for (var k in src) {
						if (k!=="id" && k!=="parent_id") {
							dst[k] = src[k];
						}
					}
				} else {
					alert("Le code n'est pas référencé");
				}
			}).error(function(data) {
				alert("Erreur lors de l'import de " + code);
			});
		});

		menuHide();
	}

	$scope.menuDoExport = function menuDoExport() {
		var askForBarcode = function() {
			barcodeService.askForBarcode("Exporter vers", function(code) {
				var sid = barcodeService.eanNormalize(code).substr(0,12);
				var id = parseInt(sid, 10);
				var src = $scope.thing;
				var dst = {"id":id};
				for (var k in src) {
					if (k!=="id" && k!=="parent_id") {
						dst[k] = src[k];
					}
				}
				console.log("iiid",dst);
				$http.put('api/things/'+id, dst)
					.success(function() {
						soundService.beep();
						document.location.hash = "#/things/" + sid;
						setTimeout(function(){
							askForBarcode();
						}, 10);
					})
					.error(function() {
						alert("Erreur lors de l'export de " + $scope.thing.id + " vers " + id);
					});
			});
		};

		askForBarcode();

		menuHide();
	}

	$scope.menuMoveTo = function menuMoveTo() {
		barcodeService.askForBarcode("Ranger dans…", function(code) {
			$scope.thing.parent_id = parseInt(barcodeService.eanNormalize(code).substr(0,12), 10);
		});

		menuHide();
	}

	$scope.menuInventory = function menuInventory() {
		menuHide();
	}

	$scope.menuPrintSmall = function menuPrintSmall() {
		var sid = barcodeService.eanNormalize($scope.thing.id).substr(0,12);
		$http.post('http://172.16.13.251/fp/running?ean='+sid);

		menuHide();
	}

	$scope.menuPrintBig = function menuPrintBig() {
		var sid = barcodeService.eanNormalize($scope.thing.id).substr(0,12);
		$http.post('http://172.16.13.250/fp/running?ean='+sid);

		menuHide();
	}


	$scope.readwrite = false;
	$scope.swapReadwrite = function swapReadwrite() {
		$scope.readwrite = !$scope.readwrite;
	};

	$scope.eanNormalize = barcodeService.eanNormalize;

	if (barcodeService.eanNormalize($routeParams.thingId) != (""+$routeParams.thingId)) {
		$location.replace(); // Replace the browser history
		$location.path("/things/"+barcodeService.eanNormalize($routeParams.thingId));
	}

	$scope.nav = nav;

	modelSyncBackendService.watchModel($scope, "thing");

	$scope.eanVisualCode = barcodeService.eanVisualCode;

	$scope.uploadImage = function() {
		var fileSelector = document.createElement('input');
		fileSelector.setAttribute('type', 'file');
		fileSelector.setAttribute('accept', 'image/png,image/jpeg');
		fileSelector.setAttribute('capture', 'camera');
		fileSelector.click();
		$(fileSelector).on('change', function(event) {
			// ...then trigger a new upload of selected image file
			var file = event.target.files[0];
			if (file) {
				console.log("upload", file);
				putFile(file);
			}
		});
	};

	$scope.printEan = printerService.printEan;

	function putFile(file) {
		$http.post('api/blobs', file, {"headers": {"Content-Type": file.type}}).success(function(data) {
			$scope.thing.image_id = data.id;
		});
	}

	$http.get('api/things/'+parseInt(barcodeService.eanNormalize($routeParams.thingId).substr(0,12),10)).success(function(data) {
		for (var k in data) {
			$scope[k] = data[k];
		}

		// $scope.visualCode = function(ean) {
		// 	if (ean >= 1000000000000) {
		// 		return null;
		// 	} else {
		// 		// Workaround
		// 		//
		// 		// Math.ceil is not necessary, but with Chrome, when the function is called,
		// 		// after a number of times, it returnes a wrong value
		// 		//
		// 		// Hypothesis: chrome after detecting this function is called often, triggers
		// 		// an recompile that should optimize the execution speed, but instead makes
		// 		// wrong optimization assumptions and make errors.
		// 		//
		// 		// Tested with string "40000000002" that returned with Math.floor(crc / 26)
		// 		// 164432274 (correct) but then -758776 (incorrect) after ~400 times
		// 		// within a setTimeout 1ms loop.
		// 		// Bug triggered on Mac os 10.9.4 Chrome 37.0.2062.120
		// 		var crc = Math.ceil(crc32(""+ean));

		// 		var a = crc % 26 + 65;
		// 		var b = Math.floor(crc / 26) % 26 + 65;
		// 		return String.fromCharCode(a) + String.fromCharCode(b);
		// 	}
		// };

		$scope.onNewBarcode = function onNewBarcode(code){
			document.location.hash = "#/things/" + code.substr(0,12);
		};


		$scope.$on("barcode", function(event, barcode) {
			soundService.beep();
			setTimeout(function() {
				document.location.hash = "#/things/" + barcode;
			}, 0);
		});

		// $scope.$watch("nav.tab", function onTabNameChange(tabName) {
		// 	switch(tabName) {
		// 		case nav.INPUT:
		// 			break;
		// 	}
		// });

		// On new thing, reset ui state
		nav.goToLastContentTab();

		$scope.moveObject = function moveObject(id){
			barcodeService.askForBarcode("Move object to", function(toCode){
				console.log("thing", $scope.thing);
				$scope.thing.parent_id = toCode;
				console.log("TODO: refresh");
			});
		}

	});
});
