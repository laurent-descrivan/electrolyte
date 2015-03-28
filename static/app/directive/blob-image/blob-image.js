"use strict";

electrolyte.directive('elBlobImage', function($http) {
	return {
		require: "ngModel",
		restrict: 'E',
		scope: {
			placeholder: "@"
		},
		templateUrl: 'app/directive/blob-image/blob-image.html',
		link: function (scope, element, attrs, ngModel) {

			scope.id = null;
			scope.uploading = false;

			ngModel.$render = function() {
				scope.id = ngModel.$viewValue;
			};

			function putFile(file) {
				scope.uploading = true;
				$http.post('api/blobs', file, {"headers": {"Content-Type": file.type}}).success(function(data) {
					ngModel.$setViewValue(data.id);
					ngModel.$render()
					scope.uploading = false;
				});
			}

			scope.upload = function() {
				var fileSelector = document.createElement('input');
				fileSelector.setAttribute('type', 'file');
				fileSelector.setAttribute('accept', 'image/png,image/jpeg');
				fileSelector.setAttribute('capture', 'camera');
				fileSelector.click();
				$(fileSelector).on('blur', function(event) {
					console.log("BLUEEEr");
				});
				$(fileSelector).on('change', function(event) {
					console.log("HREFD");
					// ...then trigger a new upload of selected image file
					var file = event.target.files[0];
					if (file) {
						putFile(file);
					}
				});
			};

			scope.blobUrl = function(id) {
				if (id) {
					return "/api/blobs/600/0/" + id;
				} else {
					return "/app/page/thing/hexdoll_soldering_iron_stand_transparent.svg";
				}
			};
		}
	};
});
