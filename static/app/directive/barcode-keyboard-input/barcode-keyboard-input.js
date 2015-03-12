"use strict";

electrolyte.directive('elBarcodeKeyboardInput', function($timeout, virtualNumericInputService, barcodeService) {

	return {
		restrict: 'E',
		scope: {
			elCode: "&",
			elClose: "&",
			elPrompt: "@"
		},
		templateUrl: 'app/directive/barcode-keyboard-input/barcode-keyboard-input.html',
		link: function (scope, element, attrs) {

			var ZERO_INPUT_CODE = "0000000000000";
			var EMPTY_INPUT_CODE = "\u02CD\u02CD\u02CD\u02CD\u02CD\u02CD\u02CD\u02CD\u02CD\u02CD\u02CD\u02CD";
			scope.displayInputCode = function displayInputCode(inputCode) {
				var checksum = barcodeService.eanChecksum(inputCode + ZERO_INPUT_CODE.substr(inputCode.length));
				inputCode = inputCode + EMPTY_INPUT_CODE.substr(inputCode.length);
				return inputCode.substr(0,1) + " " + inputCode.substr(1,6) + " " + inputCode.substr(7,5) + checksum;
			};

			scope.resetInput = function resetInput(){
				scope.inputCode = "040000";
			}
			scope.resetInput();

			scope.$watch("inputCode", function(value){
				if (value.length==12) {
					$timeout(function(){
						if (!barcodeScannerDetected) {
							scope.elCode({code:value+barcodeService.eanChecksum(value)});
						}
					}, 500);
				}
			});

			var exit = function exit() {
				document.removeEventListener("keydown", onKeydown, true);
				scope.elClose();
			}

			// Add barcode scanner detection to prevent laser scans to be mixed up with user typing
			var barcodeScannerDetected = false;
			var onKeydown = function onKeydown(event) {
				barcodeScannerDetected = true;
				event.preventDefault();
				barcodeService.scannerKeypressHandler(event, function(barcode){
					exit();
					console.log("via scanner", barcode);
					scope.elCode({code:barcode});
				});
			};

			document.addEventListener("keydown", onKeydown, true);

			virtualNumericInputService.display(function(evt) {
				if (scope.inputCode.length<12) {
					switch(evt) {
						case virtualNumericInputService.EVENT_KEY_0:
							scope.inputCode += "0";
							break;
						case virtualNumericInputService.EVENT_KEY_1:
							scope.inputCode += "1";
							break;
						case virtualNumericInputService.EVENT_KEY_2:
							scope.inputCode += "2";
							break;
						case virtualNumericInputService.EVENT_KEY_3:
							scope.inputCode += "3";
							break;
						case virtualNumericInputService.EVENT_KEY_4:
							scope.inputCode += "4";
							break;
						case virtualNumericInputService.EVENT_KEY_5:
							scope.inputCode += "5";
							break;
						case virtualNumericInputService.EVENT_KEY_6:
							scope.inputCode += "6";
							break;
						case virtualNumericInputService.EVENT_KEY_7:
							scope.inputCode += "7";
							break;
						case virtualNumericInputService.EVENT_KEY_8:
							scope.inputCode += "8";
							break;
						case virtualNumericInputService.EVENT_KEY_9:
							scope.inputCode += "9";
							break;
					}
				}

				switch(evt) {
					case virtualNumericInputService.EVENT_KEY_BACKSPACE:
						scope.inputCode = scope.inputCode.slice(0,-1);
						break;
					case virtualNumericInputService.EVENT_END:
						exit();
						break;
				}
			});
		}
	};
});
