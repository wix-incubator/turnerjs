W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';

    angular.module('angularEditor').factory('biEvent', function () {
        var biEventManager = window.LOG,
            biEvent = {
                reportEvent: function (eventName, args) {
                    biEventManager.reportEvent(eventName, args);
                },

                reportError: function (errorName, className, methodName, params) {
                    biEventManager.reportError(errorName, className, methodName, params);
                }
            };
        return biEvent;
    });
});