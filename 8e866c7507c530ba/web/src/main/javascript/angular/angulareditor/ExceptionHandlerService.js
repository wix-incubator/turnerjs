W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';

    angular.module('angularEditor').factory('$exceptionHandler', function ($log, biEvent) {
        return function (exception, cause) {
            //todo, report BI event
            var dsc = [];
            dsc.push(exception.message);
            dsc.push(exception.stack);
            dsc.push(cause);
            biEvent.reportError(wixErrors.ANGULAR_EXCEPTION, 'angular', null, dsc);
            $log.error(exception);
        };
    });
});