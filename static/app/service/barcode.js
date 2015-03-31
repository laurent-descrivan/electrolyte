"use strict";

(function(){
	function BarcodeService($rootScope, $compile, $timeout) {
		var that = this;

		function prng10k(n){
			var a  = (217*2*5*4)+1; // m prime factors are 2 & 5, and m is divisible by 4. 217 is arbitrary
			var c  = 3331; // c is about m/3, but prime
			var m  = 10000; // m is decimal, and m**2+m is lower than 31 bits integer for correct computation in 32 bits env
			return (a*n+c) % m;
		}

		that.eanVisualCode = function eanVisualCode(s) {
			s = ""+s;
			s = "000000000000".substring(s.length) + s;
			var init = s;
			var sum = 0;
			while(s.length>0) {
				var chunk = s.substr(s.length-4);
				s = s.substr(0,s.length-4);
				sum = (sum + parseInt(chunk, 10)) % 10000;
				sum = prng10k(sum);
			}
			sum = sum % 676;
			return String.fromCharCode(65 + (sum / 26)) + String.fromCharCode(65 + (sum % 26));
		};

		var EMPTY_EAN = "040000000000";
		that.eanNormalize =  function eanNormalize(ean_code) {
			if ((typeof ean_code) == "number") {
				ean_code = ean_code.toString();
				ean_code = EMPTY_EAN.substr(0,EMPTY_EAN.length-ean_code.length)+ean_code;
			}

			if (ean_code.length<13) {
				ean_code = EMPTY_EAN.substr(0,EMPTY_EAN.length-ean_code.length)+ean_code;
			}

			if (ean_code.length==12) {
				ean_code = ean_code + that.eanChecksum(ean_code);
			}

			return ean_code;
		};

		that.eanChecksum = function eanChecksum(number) {
			var chars, counter;
			counter = 0;
			chars = number.split("");
			$.each(chars, function(key, value) {
				if (key % 2 === 0) {
					return counter += parseInt(value, 10);
				} else {
					return counter += 3 * parseInt(value, 10);
				}
			});
			return (10 - (counter % 10)) % 10;
		};

		(function(){
			var scannerBuffer = [];
			var scannerFastTypingTimer;
			var keyToNumberMap = {
				"0":  "0",
				"1":  "1",
				"2":  "2",
				"3":  "3",
				"4":  "4",
				"5":  "5",
				"6":  "6",
				"7":  "7",
				"8":  "8",
				"9":  "9",

				"à": "0",
				"&": "1",
				"é": "2",
				'"': "3",
				"'": "4",
				"(": "5",
				"§": "6",
				"è": "7",
				"!": "8",
				"ç": "9"
			};

			var defaultBarcodeEvent = function(barcode) {
				$rootScope.$broadcast("barcode", barcode);
			};

			var sendbufferToInput = function() {
				console.log("send buffer to input");
				var field = document.activeElement;
				if (field.nodeName == "TEXTAREA" || field.nodeName == "INPUT") {
					if (field.selectionStart != null) {

						if (0<=field.maxLength && field.maxLength<=1000) {
							var remaningChars = field.maxLength-field.value.length+(field.selectionEnd-field.selectionStart);
							console.log("remaningChars",remaningChars);
							if (remaningChars<=0) {
								scannerBuffer = [];
							} else {
								scannerBuffer = scannerBuffer.slice(0, remaningChars);
							}
						}

						if (scannerBuffer.length>0) {
							var startPos = field.selectionStart;
							var endPos = field.selectionEnd;
							field.value = field.value.substring(0, startPos) + scannerBuffer.join("") + field.value.substring(endPos, field.value.length);
							field.selectionStart = startPos + scannerBuffer.length;
							field.selectionEnd = field.selectionStart;

							var evt = document.createEvent("HTMLEvents");
							evt.initEvent("change", false, true);
							field.dispatchEvent(evt);
						}
					}
				}

				scannerBuffer = [];
			};

			that.scannerKeypressHandler = function scannerKeypressHandler(event, barcodeEvent) {
				var typedKey = String.fromCharCode(event.which);
				if (keyToNumberMap[typedKey]) {
					event.preventDefault();
					scannerBuffer.push(String.fromCharCode(event.which));

					$timeout.cancel(scannerFastTypingTimer);
					scannerFastTypingTimer = null;

					var checkFastbuffer = function() {
						scannerFastTypingTimer = null;

						if (scannerBuffer.length >= 10) {
							var barcode = scannerBuffer.map(function(key){ return keyToNumberMap[key] || "" }).join("");
							scannerBuffer = [];

							// Some barcode scanners might strip leading zeroes. In this case, we can fill them, while
							// filtering barcodes less than 11 of length, since they cannot happen in this system.
							// This length filter can prevent erroneous barcode detection.
							if (barcode.length >= 11) {
								barcode = "0000000000000".slice(barcode.length) + barcode;
							}

							// Check ean13 barcode length and checksum, and if ok broadcast barcode event
							if (barcode.length==13 && parseInt(barcode.slice(-1), 10) === that.eanChecksum(barcode.slice(0, -1))) {
								(barcodeEvent || defaultBarcodeEvent)(barcode);
							}
						} else {
							sendbufferToInput();
						}
					}

					scannerFastTypingTimer = $timeout(checkFastbuffer, 100);
				// } else {

				// 	var scannerInputStartKeyCode = 0x42; // Ctrl-B = ASCII STX code sent by barcode scanner before each input
				// 	var scannerInputEndKeyCode   = 0x43; // Ctrl-C = ASCII ETX code sent by barcode scanner after each input

				// 	if (event.which==219 || event.which==3 || event.which==scannerInputStartKeyCode || event.which==scannerInputEndKeyCode) {
				// 		console.log(event);
				// 		event.preventDefault();
				// 	} else {
				// 		sendbufferToInput();
				// 	}
				}
			};
		})();

		var askForBarcodeTemplate =
			'<el-barcode-keyboard-input el-prompt="{{prompt}}" el-close="onClose()" el-code="onEnteredBarcode(code)">aaaaaaaaaaaaaa</el-barcode-keyboard-input>'

		that.askForBarcode = function askForBarcode(prompt, callback) {
			var scope = $rootScope.$new(true);
			scope.prompt = prompt;
			var el = $compile(askForBarcodeTemplate)(scope);

			var unregisterBarcodeHandler = $rootScope.$on("barcode", function(event, barcode) {
				event.preventDefault();
				scope.onEnteredBarcode(barcode)
			});

			scope.onClose = function onClose() {
				unregisterBarcodeHandler();
				el.remove();
			}
			scope.onEnteredBarcode = function onEnteredBarcode(code) {
				callback(code);
				scope.onClose();
			}

			$(document.body).append(el);
		};
	};

	angular.module("electrolyte").service("barcodeService", BarcodeService);
})();

angular.module("electrolyte").run(function($rootScope, barcodeService) {
	document.addEventListener("keypress", barcodeService.scannerKeypressHandler, true);
});
