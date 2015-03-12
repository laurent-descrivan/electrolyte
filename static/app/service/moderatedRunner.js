"use strict";

(function(){
	var DEFAULT_MODERATION_DELAY_MS = 1000;

	function ModeratedRunnerService($timeout) {
		var that = this;

		that.NewRunner = function NewRunner(defaultDelay) {
			if (!defaultDelay) {
				defaultDelay = DEFAULT_MODERATION_DELAY_MS;
			}

			var dirty = false
			var timer = null;
			var step = 0;
			var runFunc = null;

			var moderatedRunner = function moderatedRunner(runFunction, delayBetweenRuns) {
				if (!delayBetweenRuns) {
					delayBetweenRuns = defaultDelay;
				}

				runFunc = runFunction;

				// If last step is reached, re-run runFunction if dirty
				var bounce = function() {
					if (step==3) {
						step = 0;

						if (timer) {
							$timeout.cancel(timer);
							timer = null;
						}

						if (dirty) {
							dirty = false;
							moderatedRunner(runFunc, delayBetweenRuns);
						}
					}
				}

				if (step==0) {
					step++;

					timer = $timeout(function() {
						step++;
						timer = null;
						bounce();
					}, delayBetweenRuns);

					runFunction(function() {
						step++;
						bounce();
					});
				} else {
					dirty = true;
				}
			}
			return moderatedRunner;
		};
	}

	angular.module("electrolyte").service("moderatedRunnerService", ModeratedRunnerService);
})();
