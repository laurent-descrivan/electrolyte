"use strict";

(function(){
	function ModelSyncBackendService($http, $rootScope, $timeout, noticeService) {
		var that = this;

		// Number of models that must be synchronized, but currently are not
		that.dirty = 0;

		// Make a new scope to watch synchronized models
		var watchedModels = $rootScope.$new(true);
		var currentId = 0;

		that.addModel = function addModel(model) {
			// Prevent add twice a model, and count references
			for(var key in watchedModels){
				if(watchedModels[key] === model){
					++watchedModels[key+"_count"];
					return;
				}
			}

			var id = "model_" + (++currentId);
			var updateTimer = null;
			var dirty = false;

			watchedModels[id] = model;
			watchedModels[id+"_count"] = 1;
			watchedModels[id+"_unwatch"] = watchedModels.$watch(id, function(newModel, oldModel) {
				// If the model is not valid, exit
				if (!(newModel && newModel.id>0)) {
					return;
				}

				// If the model is new, it was not changed and does not need to be saved back
				if (!oldModel || oldModel == newModel) {
					return;
				}

				dirty = true;
				if (!updateTimer) {
					that.dirty++;

					var sendUpdates = function() {
						dirty = false;
						$http.put('api/things/'+newModel.id, newModel).success(resendUpdates).error(function() {
							noticeService.error("Error while saving data");
							resendUpdates();
						});
					};

					var resendUpdates = function() {
						if (dirty) {
							updateTimer = $timeout(sendUpdates, 2000);
						} else {
							// If model not dirty once again, abort future updates
							that.dirty--;
							updateTimer = null;
						}
					};

					updateTimer = $timeout(sendUpdates, 1000);
				}
			}, true);
		}

		that.removeModel = function removeModel(model) {
			for (var id in watchedModels) {
				if (watchedModels[id] === model) {
					var count = (--watchedModels[id+"_count"]);
					if (count==0) {
						watchedModels[id+"_unwatch"]();
						delete watchedModels[id];
						delete watchedModels[id+"_unwatch"];
						delete watchedModels[id+"_count"];
					}
					return;
				}
			}
		}

		that.watchModel = function watchModel(scope, watchExpression) {
			var watchedModel = null;

			scope.$watch(watchExpression, function(newModel, oldModel){
				if (newModel !== oldModel) {
					if (oldModel) {
						that.removeModel(oldModel);
					}

					if (newModel) {
						that.addModel(newModel);
					}
					watchedModel = newModel;
				}
			});

			scope.$on("$destroy", function(){
				that.removeModel(watchedModel);
			});

		}
	}

	angular.module("electrolyte").service("modelSyncBackendService", ModelSyncBackendService);
})();
