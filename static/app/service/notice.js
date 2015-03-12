"use strict";

(function(){
	function NoticeService($rootScope, $compile, $timeout) {
		var that = this;

		var noticeTemplate =
			'<div><span class="label label-{{level}}">{{msg}}</span></div>'

		var notices = $('<div class="el-notices"></div>');
		$(document.body).append(notices);

		function notice(msg, level) {
			console.log("log:",msg);
			var scope = $rootScope.$new(true);
			scope.msg = msg;
			scope.level = level;
			var el = $compile(noticeTemplate)(scope);
			notices.append(el);
			$timeout(function(){
				el.remove();
			}, 3000);
		}

		that.error = function errorNotice(msg) {
			notice(msg, "danger");
		};

		that.warning = function warningNotice(msg) {
			notice(msg, "warning");
		};

		that.info = function infoNotice(msg) {
			notice(msg, "info");
		};
	}

	angular.module("electrolyte").service("noticeService", NoticeService);
})();
