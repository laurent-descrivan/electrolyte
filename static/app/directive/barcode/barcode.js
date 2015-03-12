"use strict";

electrolyte.directive('elBarcode', function(barcodeService) {
	var EAN_DIGITS = {
		"LEFT_ODD":  ["0001101","0011001","0010011","0111101","0100011","0110001","0101111","0111011","0110111","0001011"],
		"LEFT_EVEN": ["0100111","0110011","0011011","0100001","0011101","0111001","0000101","0010001","0001001","0010111"],
		"RIGHT":     ["1110010","1100110","1101100","1000010","1011100","1001110","1010000","1000100","1001000","1110100"]
	};

	// Border guard
	function BG(outbars, digits) { return append(outbars, "101"); }
	// Center guard
	function CG(outbars, digits) { return append(outbars, "01010"); }
	// Left odd digit
	function LO(outbars, digits) { return append(outbars, EAN_DIGITS.LEFT_ODD[digits.shift().charCodeAt(0)-48]); }
	// Left even digit
	function LE(outbars, digits) { return append(outbars, EAN_DIGITS.LEFT_EVEN[digits.shift().charCodeAt(0)-48]); }
	// Right digit
	function  R(outbars, digits) { return append(outbars, EAN_DIGITS.RIGHT[digits.shift().charCodeAt(0)-48]); }

	function append(outbars, digits) {
		var previousBar;
		if (outbars.length==0) {
			previousBar = {"x": 0, "w": 0};
		} else {
			previousBar = outbars.pop();
		}

		for (var i=0, d=digits.split(""); i<d.length; i++) {
			if (d[i]=="0") {
				if (previousBar.w>0) {
					outbars.push(previousBar);
					previousBar = {"x": previousBar.x+previousBar.w, "w": 0};
				}
				previousBar.x += 1;
			} else {
				previousBar.w += 1;
			}
		}
		outbars.push(previousBar);
	}

	var EAN_CODING = [
		[ BG, LO, LO, LO, LO, LO, LO, CG, R, R, R, R, R, R, BG ],
		[ BG, LO, LO, LE, LO, LE, LE, CG, R, R, R, R, R, R, BG ],
		[ BG, LO, LO, LE, LE, LO, LE, CG, R, R, R, R, R, R, BG ],
		[ BG, LO, LO, LE, LE, LE, LO, CG, R, R, R, R, R, R, BG ],
		[ BG, LO, LE, LO, LO, LE, LE, CG, R, R, R, R, R, R, BG ],
		[ BG, LO, LE, LE, LO, LO, LE, CG, R, R, R, R, R, R, BG ],
		[ BG, LO, LE, LE, LE, LO, LO, CG, R, R, R, R, R, R, BG ],
		[ BG, LO, LE, LO, LE, LO, LE, CG, R, R, R, R, R, R, BG ],
		[ BG, LO, LE, LO, LE, LE, LO, CG, R, R, R, R, R, R, BG ],
		[ BG, LO, LE, LE, LO, LE, LO, CG, R, R, R, R, R, R, BG ]
	];

	function encodeEan(code) {
		var digits = code.split("");
		var coding = EAN_CODING[digits.shift().charCodeAt(0)-48];
		var output = [];
		for (var i=0; i<coding.length; i++) {
			coding[i](output, digits);
		}
		return output;
	};

	return {
		restrict: 'E',
		scope: {
			elCode: "@",
		},
		templateUrl: 'app/directive/barcode/barcode.html',
		link: function (scope, element, attrs) {
			scope.$watch("elCode", function(elCode) {
				if (/^[0-9]{12}$/.test(elCode)) {
					elCode += barcodeService.eanChecksum(elCode);
				}
				if (/^[0-9]{13}$/.test(elCode)) {
					scope.code = elCode;
					scope.bars = encodeEan(elCode);
				} else {
					scope.code = null;
					scope.bars = null;
				}
			});
		}
	};
});
