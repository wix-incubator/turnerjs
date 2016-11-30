W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';

    angular.module('angularEditor').run(function ($rootScope) {

        $rootScope.safeApply = function (fn) {
            if (typeof(fn) !== 'function') {
                return;
            }

            var phase = this.$root.$$phase;
            if (phase == '$apply' || phase == '$digest') {
                fn();
            } else {
                this.$apply(fn);
            }
        };
    });
});