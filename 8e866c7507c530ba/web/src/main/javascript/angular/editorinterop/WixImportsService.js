W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';

    /**
     * @ngdoc service
     * @name editorInterop.factory:wixImports
     * @description
     * Imports a wix class.
     */

    angular.module('editorInterop').factory('wixImports', function () {
        var classes = W.Classes;
        return {
            importClass: function (className) {
                return classes.getClass(className);
            }
        };
    });

});