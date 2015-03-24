"use strict";

electrolyte.directive('elMobileviewNavbar', function(nav) {
	return {
		restrict: 'E',
		scope: {},
		controller: function ($scope) {

			$scope.nav = nav;

			// True if navbar is currently showing categories
			$scope.categoryShown = false;

			this.switchCategories = function switchCategories() {
				$scope.categoryShown = !$scope.categoryShown;
			}

			this.showCategories = function showCategories() {
				$scope.categoryShown = true;
			}

			this.hideCategories = function hideCategories() {
				$scope.categoryShown = false;
			}
		},
		transclude: true,
		templateUrl: 'app/directive/mobileview/navbar/mobileview-navbar.html'
	};
});

electrolyte.directive('elMobileviewNavbarCategory', function(nav, $compile) {
	return {
		require: '^elMobileviewNavbar',
		restrict: 'E',
		scope: {
			"icon": "@",
			"text": "@"
		},
		controller: function($scope) {
			$scope.pages = {};

			this.registerPage = function registerPage(pageName, isDefault) {
				$scope.pages[pageName] = true;
				if (isDefault || $scope.defaultPage==null) {
					$scope.defaultPage = pageName;
				}
			};
		},
		compile: function(){

			// var moreButton = $compile(
			// 	'<div>'+
			// 		'<div class="el-mobileview-navbar-item el-mobileview-navbar-more" ng-click="navbar.switchCategories()">'+
			// 			'<div>'+
			// 				'<i class="el-icon fa fa-ellipsis-h"></i>'+
			// 				'<span class="el-title">Autre</span>'+
			// 			'</div>'+
			// 		'</div>'+
			// 	'</div>'
			// );

			return function(scope, element, attrs, elMobileviewNavbar) {
				// $timeout(function(){
				// 	element.find(".el-mobileview-navbar-category-container:first").append(moreButton(scope));
				// });


				// scope.switchToCategory = function switchToCategory() {
				// 	if (!scope.pages[nav.tab]) {
				// 		scope.switchPage(scope.defaultPage);
				// 	}
				// 	elMobileviewNavbar.hideCategories();
				// }
				// scope.disp = function(pages,tab) {
				// 	console.log("true?", scope.pages,tab, pages[tab]);
				// 	return pages[tab];
				// }

				// setTimeout(function(){console.log(element.find(".el-mobileview-navbar-category-container:first")[0]);element.find(".el-mobileview-navbar-category-container:first").append(s);},10);

				// scope.navbar = elMobileviewNavbar;
				// console.log("post", element.html§);
				scope.nav = nav;
				scope.switchPage = function(pageName) {
					elMobileviewNavbar.hideCategories();
					nav.goTo(pageName);
				};

				scope.navbar = elMobileviewNavbar;
			};
		},
		transclude: true,
		templateUrl: 'app/directive/mobileview/navbar/mobileview-navbar-category.html'
	};
});

electrolyte.directive('elMobileviewNavbarPage', function(nav) {
	return {
		require: ['^elMobileviewNavbarCategory','^elMobileviewNavbar'],
		restrict: 'E',
		scope: {
			"icon": "@",
			"name": "@",
			"text": "@"
		},
		link: function(scope, element, attrs, controllers) {
			var elMobileviewNavbarCategory = controllers[0], elMobileviewNavbar = controllers[1];

			scope.$evalAsync(function(){
				elMobileviewNavbarCategory.registerPage(scope.name, attrs.elMobileviewNavbarDefault!=null);
			});


			scope.navbar = elMobileviewNavbar;
			scope.nav = nav;
			scope.switchPage = function(pageName) {
				elMobileviewNavbar.hideCategories();
				nav.goTo(pageName);
			};
		},
		templateUrl: 'app/directive/mobileview/navbar/mobileview-navbar-page.html'
	};
});

