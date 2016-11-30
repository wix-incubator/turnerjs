W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';

    angular.module('angularEditor').factory('editorUtils', function () {
        var utilsManager = W.Utils;

        return {
            getPositionRelativeToWindow: function (elm) {
                return utilsManager.getPositionRelativeToWindow(elm);
            }
        };
    });
});