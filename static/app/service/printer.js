"use strict";

(function(){
	function PrinterService($http, barcodeService) {
		var that = this;

		that.printEan = function printEan(ean, format) {
			var ip;
			switch (format) {
				case 'small':
					ip = "172.16.42.21"
					break;
			}

			ean = barcodeService.eanNormalize(ean).substring(0,12);

			$http.post('http://'+ip+'/fp/running?ean='+ean);
		}
	}

	angular.module("electrolyte").service("printerService", PrinterService);
})();
