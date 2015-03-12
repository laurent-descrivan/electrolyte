"use strict";

(function(){
	function SoundService() {
		var that = this;

		var beepAudio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU'+Array(200).join(123));
		that.beep = function sound(formula) {
			beepAudio.play();
		};
	}

	angular.module("electrolyte").service("soundService", SoundService);
})();
