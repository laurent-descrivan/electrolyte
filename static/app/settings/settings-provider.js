"use strict";

///////////
//
///////////

(function(){
	electrolyte.factory('nav', function navFactory() {
		function Nav() {
			var that = this;

			function isContentTab(tabName) {
				return tabName==that.DESCRIPTION || tabName==that.LOCATION || tabName==that.CONTENT;
			}

			that.INPUT = "INPUT";
			that.DESCRIPTION = "DESCRIPTION";
			that.LOCATION = "LOCATION";
			that.CONTENT = "CONTENT";
			that.SETTINGS = "SETTINGS";

			that.tab = "DESCRIPTION";
			that._lastContentTab = that.tab;

			that.goTo = function goTo(tabName) {
				if (isContentTab(tabName)) {
					that._lastContentTab = tabName;
				}
				that.tab = tabName;
			};

			that.goToLastContentTab = function goToLastContentTab() {
				that.goTo(that._lastContentTab);
			};

		}
		return new Nav();
	});
})();
