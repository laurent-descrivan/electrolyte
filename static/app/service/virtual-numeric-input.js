"use strict";

(function(){
	function VirtualNumericInputService($rootScope) {
		var that = this;

		var e;
		var onKey;

		var key0 = "0".charCodeAt(0);
		var key1 = "1".charCodeAt(0);
		var key2 = "2".charCodeAt(0);
		var key3 = "3".charCodeAt(0);
		var key4 = "4".charCodeAt(0);
		var key5 = "5".charCodeAt(0);
		var key6 = "6".charCodeAt(0);
		var key7 = "7".charCodeAt(0);
		var key8 = "8".charCodeAt(0);
		var key9 = "9".charCodeAt(0);
		var keyBackspace = 8;

		that.EVENT_KEY_1 = 1
		that.EVENT_KEY_2 = 2
		that.EVENT_KEY_3 = 3
		that.EVENT_KEY_4 = 4
		that.EVENT_KEY_5 = 5
		that.EVENT_KEY_6 = 6
		that.EVENT_KEY_7 = 7
		that.EVENT_KEY_8 = 8
		that.EVENT_KEY_9 = 9
		that.EVENT_KEY_0 = 10
		that.EVENT_KEY_BACKSPACE = 11;
		that.EVENT_END = 12

		that.hide = function hide(callback) {
			if (onKey) {
				document.removeEventListener("keydown", onKey, true);
			}
			if (e) {
				e.remove();
			}
		};

		that.display = function display(callback) {
			that.hide();

			onKey = function onKey(event) {
				var key = event.which;
				var evt;
				switch(key) {
					case key0:
						evt = that.EVENT_KEY_0;
						break;
					case key1:
						evt = that.EVENT_KEY_1;
						break;
					case key2:
						evt = that.EVENT_KEY_2;
						break;
					case key3:
						evt = that.EVENT_KEY_3;
						break;
					case key4:
						evt = that.EVENT_KEY_4;
						break;
					case key5:
						evt = that.EVENT_KEY_5;
						break;
					case key6:
						evt = that.EVENT_KEY_6;
						break;
					case key7:
						evt = that.EVENT_KEY_7;
						break;
					case key8:
						evt = that.EVENT_KEY_8;
						break;
					case key9:
						evt = that.EVENT_KEY_9;
						break;
					case keyBackspace:
						evt = that.EVENT_KEY_BACKSPACE;
						break;
				}
				if (evt) {
					$rootScope.$apply(function(){ callback(evt); });
				}
			};
			document.addEventListener("keydown", onKey, true);

			e = $('<input type="text" pattern="\\d*" style="position: fixed; bottom: -100px;" />');
			e.on("keydown", function(event){
				event.preventDefault();
			});
			e.on("blur", function(event){
				that.hide();
				$rootScope.$apply(function(){
					callback(that.EVENT_END);
				});
			});
			e.appendTo(document.body);
			e.focus();
		};
	}

	angular.module("electrolyte").service("virtualNumericInputService", VirtualNumericInputService);
})();
